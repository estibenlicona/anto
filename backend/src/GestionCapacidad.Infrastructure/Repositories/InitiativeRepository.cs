using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class InitiativeRepository(ApplicationDbContext dbContext)
    : Repository<Initiative>(dbContext), IInitiativeRepository
{
}
