import { describe, it, expect } from "vitest";
import { DEDICATION_BY_USER, TODAY, SPRINTS } from "../dedication.seeds";
import {
  DEVOPS_USERS,
  LINKED_IDENTITIES,
  type SeedIdentity,
} from "../personDetail.seeds";
import { initialAllocationSeeds, SQUAD_NAMES } from "../allocations.seeds";
import { INITIATIVE_SEEDS } from "../initiatives.seeds";
import { getPeopleSnapshot } from "../people.handlers";

/**
 * Las semillas del balance de carga no viven solas: la célula declara cuánto
 * dedica cada persona, el catálogo dice qué iniciativas existen y en qué
 * estado, y DevOps aporta la actividad. Cuando esas tres no se hablan, la
 * pantalla muestra cosas que se contradicen entre sí —alguien al 100 % en su
 * célula del que el balance no puede decir nada, o un sprint en curso
 * comprometido contra una iniciativa cerrada—.
 *
 * Cada caso de acá salió de una contradicción real que se vio en pantalla.
 */

const personIdByName = new Map(
  getPeopleSnapshot().map((person) => [person.name, person.id])
);

const identityByPerson = LINKED_IDENTITIES as Record<string, SeedIdentity>;

const userById = new Map(DEVOPS_USERS.map((user) => [user.id, user]));

const initiativeById = new Map(INITIATIVE_SEEDS.map((i) => [i.id, i]));

const identityOf = (name: string): SeedIdentity | null => {
  const personId = personIdByName.get(name);
  return personId ? (identityByPerson[personId] ?? null) : null;
};

const sprintsOf = (name: string) => {
  const identity = identityOf(name);
  return identity ? (DEDICATION_BY_USER[identity.id] ?? []) : [];
};

/** Las personas con dedicación declarada en alguna célula. */
const allocatedNames = [
  ...new Set(initialAllocationSeeds.map((a) => a.personName)),
];

/**
 * Las excepciones son las que la spec pide como caso, y están declaradas acá
 * para que agregar una sea una decisión y no un descuido.
 */
const WITHOUT_SPRINTS = ["Daniela Castaño"];

describe("la dedicación se habla con las células", () => {
  it("toda persona con asignación está vinculada a una identidad de DevOps", () => {
    // Sin identidad, su célula declara que dedica el 100 % y el balance de
    // carga no puede decir nada de ella. El caso "sin identidad" lo sostiene
    // Camila, que no tiene célula.
    const unlinked = allocatedNames.filter((name) => identityOf(name) === null);

    expect(unlinked).toEqual([]);
  });

  it("toda persona con asignación tiene actividad sembrada, salvo el caso declarado", () => {
    const withoutSprints = allocatedNames.filter(
      (name) => sprintsOf(name).length === 0
    );

    expect(withoutSprints).toEqual(WITHOUT_SPRINTS);
  });

  it("cada célula con gente asignada tiene al menos alguien medible", () => {
    const squadIds = [
      ...new Set(initialAllocationSeeds.map((a) => a.squadId)),
    ];

    for (const squadId of squadIds) {
      const measurable = initialAllocationSeeds
        .filter((a) => a.squadId === squadId)
        .filter((a) => sprintsOf(a.personName).length > 0);

      expect(measurable.length, SQUAD_NAMES[squadId]).toBeGreaterThan(0);
    }
  });
});

describe("la dedicación se habla con el catálogo de iniciativas", () => {
  const allStories = Object.entries(DEDICATION_BY_USER).flatMap(
    ([userId, sprints]) =>
      sprints.flatMap((sprint) =>
        sprint.stories.map((story) => ({
          user: userById.get(userId)?.displayName ?? userId,
          sprint: sprint.sprint,
          story,
        }))
      )
  );

  it("toda épica mapeada apunta a una iniciativa del catálogo", () => {
    const orphans = allStories
      .filter((s) => s.story.epic?.initiativeId)
      .filter((s) => !initiativeById.has(s.story.epic!.initiativeId!))
      .map((s) => `${s.user}/${s.sprint}: ${s.story.epic!.initiativeId}`);

    expect(orphans).toEqual([]);
  });

  it("el sprint en curso no compromete trabajo contra una iniciativa cerrada", () => {
    // Una iniciativa cerrada con trabajo de hoy encima es justo lo que hace
    // que el balance de carga y el backlog cuenten historias distintas. En los
    // sprints pasados sí es correcto: se trabajó en ella antes de cerrarla.
    const current = SPRINTS.find(
      (s) => s.startDate <= TODAY && TODAY <= s.endDate
    )!;

    const onClosed = allStories
      .filter((s) => s.sprint === current.name)
      .filter((s) => {
        const id = s.story.epic?.initiativeId;
        return id ? initiativeById.get(id)?.status === "Closed" : false;
      })
      .map((s) => `${s.user}: ${s.story.title}`);

    expect(onClosed).toEqual([]);
  });

  it("quien tiene célula trabaja en iniciativas de su célula", () => {
    // El arquitecto y quienes no tienen célula sí cruzan frentes: es su
    // trabajo, y por eso se declaran. Lo que no puede pasar sin darse cuenta
    // es que alguien de una célula aparezca entero en la iniciativa de otra.
    const CROSS_SQUAD = ["Tomás Giraldo"];

    for (const name of allocatedNames) {
      if (CROSS_SQUAD.includes(name)) continue;

      const squadIds = new Set(
        initialAllocationSeeds
          .filter((a) => a.personName === name)
          .map((a) => a.squadId)
      );

      const foreign = sprintsOf(name)
        .flatMap((sprint) => sprint.stories)
        .map((story) => story.epic?.initiativeId)
        .filter((id): id is string => Boolean(id))
        .map((id) => initiativeById.get(id))
        .filter((initiative) => initiative && !squadIds.has(initiative.squadId))
        .map((initiative) => `${name}: ${initiative!.name}`);

      expect(foreign, name).toEqual([]);
    }
  });
});
