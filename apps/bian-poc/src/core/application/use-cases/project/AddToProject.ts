import { ProjectRepository } from '../../../domain/ports/ProjectRepository';
import { CapabilityRepository } from '../../../domain/ports/CapabilityRepository';
import { Project } from '../../../domain/entities/Project';
import { CapabilityId } from '../../../domain/value-objects/CapabilityId';
import { FunctionalityId } from '../../../domain/value-objects/FunctionalityId';

/**
 * Caso de uso para agregar elementos a un proyecto
 */
export class AddToProject {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly capabilityRepository: CapabilityRepository
  ) {}

  /**
   * Agrega una capacidad al proyecto
   */
  async addCapability(request: AddCapabilityToProjectRequest): Promise<AddToProjectResponse> {
    try {
      // Validar entrada
      this.validateCapabilityRequest(request);

      // Obtener proyecto
      const project = await this.projectRepository.findById(request.projectId);
      if (!project) {
        return {
          success: false,
          error: `Project with ID ${request.projectId} not found`,
          timestamp: new Date()
        };
      }

      // Obtener capacidad
      const capabilityId = CapabilityId.fromString(request.capabilityId);
      const capability = await this.capabilityRepository.findById(capabilityId);
      if (!capability) {
        return {
          success: false,
          error: `Capability with ID ${request.capabilityId} not found`,
          timestamp: new Date()
        };
      }

      // Verificar si ya existe en el proyecto
      if (project.hasCapability(request.capabilityId)) {
        return {
          success: false,
          error: `Capability ${request.capabilityId} is already in the project`,
          timestamp: new Date()
        };
      }

      // Agregar capacidad al proyecto
      const updatedProject = project.addCapability(capability);

      // Guardar proyecto
      await this.projectRepository.save(updatedProject);

      return {
        success: true,
        project: updatedProject,
        message: `Capability ${capability.name} added to project successfully`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  /**
   * Agrega una funcionalidad al proyecto
   */
  async addFunctionality(request: AddFunctionalityToProjectRequest): Promise<AddToProjectResponse> {
    try {
      // Validar entrada
      this.validateFunctionalityRequest(request);

      // Obtener proyecto
      const project = await this.projectRepository.findById(request.projectId);
      if (!project) {
        return {
          success: false,
          error: `Project with ID ${request.projectId} not found`,
          timestamp: new Date()
        };
      }

      // Buscar funcionalidad en todas las capacidades
      const functionality = await this.findFunctionality(request.functionalityId);
      if (!functionality) {
        return {
          success: false,
          error: `Functionality with ID ${request.functionalityId} not found`,
          timestamp: new Date()
        };
      }

      // Verificar si ya existe en el proyecto
      if (project.hasFunctionality(request.functionalityId)) {
        return {
          success: false,
          error: `Functionality ${request.functionalityId} is already in the project`,
          timestamp: new Date()
        };
      }

      // Agregar funcionalidad al proyecto
      const updatedProject = project.addFunctionality(functionality);

      // Guardar proyecto
      await this.projectRepository.save(updatedProject);

      return {
        success: true,
        project: updatedProject,
        message: `Functionality ${functionality.name} added to project successfully`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date()
      };
    }
  }

  /**
   * Valida la solicitud para agregar capacidad
   */
  private validateCapabilityRequest(request: AddCapabilityToProjectRequest): void {
    if (!request.projectId || typeof request.projectId !== 'string') {
      throw new Error('Project ID is required and must be a string');
    }

    if (!request.capabilityId || typeof request.capabilityId !== 'string') {
      throw new Error('Capability ID is required and must be a string');
    }

    if (!CapabilityId.isValid(request.capabilityId)) {
      throw new Error('Invalid capability ID format');
    }
  }

  /**
   * Valida la solicitud para agregar funcionalidad
   */
  private validateFunctionalityRequest(request: AddFunctionalityToProjectRequest): void {
    if (!request.projectId || typeof request.projectId !== 'string') {
      throw new Error('Project ID is required and must be a string');
    }

    if (!request.functionalityId || typeof request.functionalityId !== 'string') {
      throw new Error('Functionality ID is required and must be a string');
    }

    if (!FunctionalityId.isValid(request.functionalityId)) {
      throw new Error('Invalid functionality ID format');
    }
  }

  /**
   * Busca una funcionalidad en todas las capacidades
   */
  private async findFunctionality(functionalityId: string) {
    const capabilities = await this.capabilityRepository.findAll();
    
    for (const capability of capabilities) {
      const functionality = capability.getAllFunctionalities()
        .find(func => func.id === functionalityId);
      
      if (functionality) {
        return functionality;
      }
    }
    
    return null;
  }
}

/**
 * Solicitud para agregar capacidad al proyecto
 */
export interface AddCapabilityToProjectRequest {
  projectId: string;
  capabilityId: string;
}

/**
 * Solicitud para agregar funcionalidad al proyecto
 */
export interface AddFunctionalityToProjectRequest {
  projectId: string;
  functionalityId: string;
}

/**
 * Respuesta de agregar elemento al proyecto
 */
export interface AddToProjectResponse {
  success: boolean;
  project?: Project;
  message?: string;
  error?: string;
  timestamp: Date;
}
