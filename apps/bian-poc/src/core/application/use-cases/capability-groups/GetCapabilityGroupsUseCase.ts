import { CapabilityGroupRepository } from '../../../domain/ports/CapabilityGroupRepository';
import { CapabilityGroup } from '../../../domain/entities/CapabilityGroup';
import { StyleType } from '../../../domain/value-objects/StyleType';

/**
 * Caso de uso para obtener grupos de capacidades
 */
export class GetCapabilityGroupsUseCase {
  constructor(private capabilityGroupRepository: CapabilityGroupRepository) {}

  /**
   * Obtiene todos los grupos de capacidades
   */
  async execute(): Promise<CapabilityGroup[]> {
    try {
      return await this.capabilityGroupRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to get capability groups: ${error}`);
    }
  }

  /**
   * Obtiene grupos por estilo específico
   */
  async executeByStyle(styleName: string): Promise<CapabilityGroup[]> {
    try {
      const style = new StyleType(styleName);
      return await this.capabilityGroupRepository.findByStyle(style);
    } catch (error) {
      throw new Error(`Failed to get capability groups by style: ${error}`);
    }
  }

  /**
   * Obtiene solo grupos activos
   */
  async executeActiveOnly(): Promise<CapabilityGroup[]> {
    try {
      return await this.capabilityGroupRepository.findActive();
    } catch (error) {
      throw new Error(`Failed to get active capability groups: ${error}`);
    }
  }

  /**
   * Busca grupos por nombre
   */
  async executeByName(name: string): Promise<CapabilityGroup[]> {
    try {
      if (!name || name.trim().length === 0) {
        return [];
      }
      return await this.capabilityGroupRepository.findByName(name.trim());
    } catch (error) {
      throw new Error(`Failed to search capability groups by name: ${error}`);
    }
  }
}