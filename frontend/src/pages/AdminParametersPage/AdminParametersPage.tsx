import React from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  type TagColor,
} from "@tuya-ui/components";
import { AdminPageHeader } from "@features/admin-shell/components/AdminPageHeader";
import { CapabilityMixModal } from "@features/admin-shell/components/CapabilityMixModal";
import { QuestionPoolModal } from "@features/admin-shell/components/QuestionPoolModal";
import {
  TallaDataModal,
  TallaRangesModal,
} from "@features/admin-shell/components/TallaBandsEditors";
import { useCapabilityMix } from "@features/admin-shell/hooks/useCapabilityMix";
import { useQuestionPool } from "@features/admin-shell/hooks/useQuestionPool";
import { useTallaBands } from "@features/admin-shell/hooks/useTallaBands";
import { mixAmount } from "@features/admin-shell/services/capabilityMixService";
import { dimensionSummary } from "@features/admin-shell/services/questionPoolService";
import {
  bandRange,
  formatPersonMonths,
} from "@features/admin-shell/services/tallaBandsService";

/**
 * El color acompaña a cada talla — no la ordena ni la califica. Vive en la
 * pantalla y no en el servicio porque es presentación: qué color le toca a XS
 * no es un dato del modelo de estimación, y mezclarlo obligaría al backend a
 * opinar sobre la paleta.
 */
const tallaColors: Record<string, TagColor> = {
  XS: "gray",
  S: "green",
  M: "blue",
  L: "amber",
  XL: "red",
};

const versiones = [
  {
    version: "v1 · vigente",
    autor: "Sistema",
    fecha: "carga inicial",
    nota: "Valores por defecto de criterio experto",
  },
];

/**
 * Las cuatro secciones son tablas de referencia independientes — se consultan
 * de a una, nunca se comparan entre sí — así que van en pestañas en vez de
 * apiladas. Ninguna Card lleva encabezado: la pestaña activa ya nombra la
 * sección, la misma razón por la que AdminPageHeader deja el título de la
 * pantalla en sr-only.
 */
export const AdminParametersPage: React.FC = () => {
  const bands = useTallaBands();
  const mix = useCapabilityMix();
  const questions = useQuestionPool();
  const [section, setSection] = React.useState("bandas");
  const [editingRanges, setEditingRanges] = React.useState(false);
  const [editingData, setEditingData] = React.useState(false);
  const [editingMix, setEditingMix] = React.useState(false);
  const [editingQuestions, setEditingQuestions] = React.useState(false);

  /**
   * Las columnas del mix son las tallas de las bandas guardadas, en su orden —
   * no una lista aparte. Escribirlas de nuevo acá dejaría dos listas de tallas
   * que nada obliga a que coincidan, que es justamente lo que evita indexar las
   * cantidades por talla.
   */
  const tallas = bands.values?.bands.map((band) => band.talla) ?? [];

  // Las acciones viven en la barra de pestañas, que las cuatro secciones
  // comparten — así que sólo se muestran con la de bandas abierta. Si no, dos
  // botones que hablan de bandas quedarían flotando sobre el pool de preguntas.
  const editingBandsSection =
    section === "bandas" && !bands.loading && !!bands.values;

  // El mix se edita por columnas, así que su acción también espera a las bandas:
  // sin ellas no hay columnas que editar.
  const editingMixSection =
    section === "mix" && !mix.loading && !!mix.values && tallas.length > 0;

  const editingQuestionsSection =
    section === "preguntas" && !questions.loading && !!questions.values;

  return (
    <div>
      <AdminPageHeader title="Parámetros del modelo de estimación" />

      <Tabs value={section} onValueChange={setSection}>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-neutral-default">
          <TabsList className="border-b-0">
            <TabsTrigger value="bandas">Bandas</TabsTrigger>
            <TabsTrigger value="mix">Capacidades</TabsTrigger>
            <TabsTrigger value="preguntas">Preguntas</TabsTrigger>
            <TabsTrigger value="versionado">Versionado</TabsTrigger>
          </TabsList>
          {editingBandsSection && (
            <div className="flex gap-2 pb-2">
              <Button
                variant="secondary"
                onClick={() => setEditingRanges(true)}
              >
                Editar reparto
              </Button>
              <Button variant="secondary" onClick={() => setEditingData(true)}>
                Editar datos
              </Button>
            </div>
          )}
          {editingMixSection && (
            <div className="flex gap-2 pb-2">
              <Button variant="secondary" onClick={() => setEditingMix(true)}>
                Editar mix
              </Button>
            </div>
          )}
          {editingQuestionsSection && (
            <div className="flex gap-2 pb-2">
              <Button
                variant="secondary"
                onClick={() => setEditingQuestions(true)}
              >
                Editar preguntas
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="bandas">
          <Card>
            {bands.loadError ? (
              <CardBody>
                <Alert
                  variant="danger"
                  title="No se pudieron cargar las bandas"
                >
                  {bands.loadError} Si estás corriendo el front sin mocks, esta
                  sección necesita `pnpm dev:mock`.
                </Alert>
              </CardBody>
            ) : bands.loading || !bands.values ? (
              <CardBody className="text-body-sm text-neutral-subtle">
                Cargando bandas de talla…
              </CardBody>
            ) : (
              <>
                <Table flush>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talla</TableHead>
                      <TableHead align="right">Puntaje %</TableHead>
                      <TableHead align="right">PM mín</TableHead>
                      <TableHead align="right">PM máx</TableHead>
                      <TableHead>Lectura</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bands.values.bands.map((row, index) => {
                      // El rango sale de los límites, no de un campo guardado:
                      // entre dos bandas hay un solo número.
                      const range = bandRange(bands.values!.boundaries, index);
                      return (
                        <TableRow key={row.talla}>
                          <TableCell>
                            <Tag color={tallaColors[row.talla] ?? "gray"}>
                              {row.talla}
                            </Tag>
                          </TableCell>
                          {/* Sin `%` en la celda: el encabezado de la columna
                              ya lo dice, y repetirlo cinco veces sólo agrega
                              ruido entre los dígitos que se quieren comparar. */}
                          <TableCell align="right">
                            {range.from}–{range.to}
                          </TableCell>
                          <TableCell align="right">
                            {formatPersonMonths(row.pmMin)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPersonMonths(row.pmMax)}
                          </TableCell>
                          <TableCell>{row.lectura}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="mix">
          <Card>
            {mix.loadError ? (
              <CardBody>
                <Alert
                  variant="danger"
                  title="No se pudo cargar el mix de capacidades"
                >
                  {mix.loadError} Si estás corriendo el front sin mocks, esta
                  sección necesita `pnpm dev:mock`.
                </Alert>
              </CardBody>
            ) : mix.loading || !mix.saved ? (
              <CardBody className="text-body-sm text-neutral-subtle">
                Cargando mix de capacidades…
              </CardBody>
            ) : tallas.length === 0 ? (
              // Sin bandas no hay columnas: la tabla no tendría de qué hablar.
              <CardBody>
                <Alert variant="warning" title="Faltan las bandas de talla">
                  El mix se organiza por talla, así que esta sección necesita
                  las bandas cargadas para mostrarse.
                </Alert>
              </CardBody>
            ) : (
              <Table flush>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capacidad</TableHead>
                    {tallas.map((talla) => (
                      <TableHead key={talla} align="right">
                        {talla}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Lo guardado, no lo que el editor tenga a medio escribir. */}
                  {mix.saved.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.capacidad}</TableCell>
                      {tallas.map((talla) => (
                        <TableCell key={talla} align="right">
                          {mixAmount(row, talla)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="preguntas">
          <Card>
            {questions.loadError ? (
              <CardBody>
                <Alert
                  variant="danger"
                  title="No se pudo cargar el pool de preguntas"
                >
                  {questions.loadError} Si estás corriendo el front sin mocks,
                  esta sección necesita `pnpm dev:mock`.
                </Alert>
              </CardBody>
            ) : questions.loading || !questions.saved ? (
              <CardBody className="text-body-sm text-neutral-subtle">
                Cargando pool de preguntas…
              </CardBody>
            ) : (
              <Table flush>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimensión</TableHead>
                    <TableHead align="right">Preguntas</TableHead>
                    <TableHead align="right">Peso total</TableHead>
                    <TableHead align="right">Máx. puntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Lo guardado, no lo que el editor tenga a medio escribir. */}
                  {dimensionSummary(questions.saved).map((row) => (
                    <TableRow key={row.dimension}>
                      <TableCell>{row.dimension}</TableCell>
                      <TableCell align="right">{row.preguntas}</TableCell>
                      <TableCell align="right">{row.pesoTotal}</TableCell>
                      <TableCell align="right">{row.maxPuntos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="versionado">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <Alert variant="warning" title="Propuesta, no acordada aún">
                Versionar los parámetros con autor, fecha y nota de cambio. Las
                evaluaciones ya hechas conservarían la versión con la que fueron
                calculadas, igual que el calendario de sprints no recalcula lo
                ya reportado.
              </Alert>
              <Table flush>
                <TableHeader>
                  <TableRow>
                    <TableHead>Versión</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versiones.map((row) => (
                    <TableRow key={row.version}>
                      <TableCell>{row.version}</TableCell>
                      <TableCell>{row.autor}</TableCell>
                      <TableCell>{row.fecha}</TableCell>
                      <TableCell>{row.nota}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="secondary" disabled className="self-start">
                Editar parámetros
              </Button>
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>

      <TallaRangesModal
        open={editingRanges}
        onOpenChange={setEditingRanges}
        bands={bands}
        colors={tallaColors}
      />
      <TallaDataModal
        open={editingData}
        onOpenChange={setEditingData}
        bands={bands}
        colors={tallaColors}
      />
      <CapabilityMixModal
        open={editingMix}
        onOpenChange={setEditingMix}
        mix={mix}
        tallas={tallas}
      />
      <QuestionPoolModal
        open={editingQuestions}
        onOpenChange={setEditingQuestions}
        pool={questions}
      />
    </div>
  );
};
