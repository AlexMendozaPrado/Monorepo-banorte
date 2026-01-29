'use client';

import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Folder, Layers, ExternalLink } from 'lucide-react';
import { Chip } from './ui/Chip';
import { CapabilityGroup } from '../../core/domain/entities/CapabilityGroup';
import { BaseFunction } from '../../core/domain/entities/BaseFunction';

interface TreeNavigationProps {
  capabilityGroups: CapabilityGroup[];
  expanded: string[];
  onExpandedChange: (itemIds: string[]) => void;
  onSelect: (event: React.SyntheticEvent, itemId: string) => void;
  onOpenModal: (
    baseFunction: BaseFunction,
    groupName: string,
    capabilityName: string,
    subCapabilityName: string,
    event: React.MouseEvent
  ) => void;
}

export function TreeNavigation({
  capabilityGroups,
  expanded,
  onExpandedChange,
  onSelect,
  onOpenModal,
}: TreeNavigationProps) {
  if (!capabilityGroups || capabilityGroups.length === 0) return null;

  return (
    <SimpleTreeView
      expandedItems={expanded}
      onExpandedItemsChange={(_, itemIds) => onExpandedChange(itemIds)}
      onSelectedItemsChange={(event, itemId) => {
        if (itemId && event) {
          onSelect(event, itemId as string);
        }
      }}
      sx={{
        '& .MuiTreeItem-root': {
          '& .MuiTreeItem-content': {
            fontFamily: 'Gotham, Montserrat, sans-serif',
            fontSize: '14px',
            color: '#323E48',
          },
        },
      }}
    >
      {capabilityGroups.flatMap((group, groupIndex) =>
        group.capabilities?.map((capability, capIndex) => {
          const capabilityId = `group-${groupIndex}-cap-${capIndex}`;
          return (
            <TreeItem
              key={capabilityId}
              itemId={capabilityId}
              label={
                <div className="flex items-center py-1">
                  <Folder size={14} className="mr-2 text-banorte-red" />
                  <span className="text-sm font-bold flex-1">{capability.name}</span>
                  <Chip
                    label={capability.subCapabilities?.length || 0}
                    color="#EBF0F2"
                    textColor="#5B6670"
                  />
                </div>
              }
              sx={{
                '& > .MuiTreeItem-content': {
                  padding: '4px 8px',
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: 'rgba(235, 0, 41, 0.05)' },
                  '&.Mui-selected': {
                    backgroundColor: '#EB0029 !important',
                    color: 'white',
                    '& .MuiTypography-root': { color: 'white' },
                    '& span': { color: 'white' },
                  },
                },
              }}
            >
              {capability.subCapabilities?.map((subCapability, subIndex) => {
                const subCapabilityId = `group-${groupIndex}-cap-${capIndex}-sub-${subIndex}`;
                const totalFuncs = subCapability.baseFunctions?.reduce(
                  (acc, bf) => acc + (bf.functionalities?.length || 0), 0
                ) || 0;

                return (
                  <TreeItem
                    key={subCapabilityId}
                    itemId={subCapabilityId}
                    label={
                      <div className="flex items-center py-1 w-full" title={subCapability.description || subCapability.name}>
                        <Layers size={14} className="mr-2 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium flex-1 truncate">{subCapability.name}</span>
                        <Chip
                          label={`${subCapability.baseFunctions?.length || 0} / ${totalFuncs}`}
                          color="#e3f2fd"
                          textColor="#1976d2"
                          className="font-bold ml-1 flex-shrink-0"
                        />
                      </div>
                    }
                    sx={{
                      ml: 1,
                      '& > .MuiTreeItem-content': {
                        padding: '4px 8px',
                        borderRadius: '4px',
                        borderLeft: '2px solid #1976d2',
                        '&:hover': { backgroundColor: '#e3f2fd' },
                        '&.Mui-selected': {
                          backgroundColor: '#1976d2 !important',
                          color: 'white',
                          '& span': { color: 'white' },
                        },
                      },
                    }}
                  >
                    {subCapability.baseFunctions?.map((baseFunction, baseIndex) => {
                      const baseFunctionId = `group-${groupIndex}-cap-${capIndex}-sub-${subIndex}-base-${baseIndex}`;
                      const funcCount = baseFunction.functionalities?.length || 0;

                      return (
                        <TreeItem
                          key={baseFunctionId}
                          itemId={baseFunctionId}
                          label={
                            <div
                              className="flex items-center py-1 w-full"
                              title={baseFunction.description || `${funcCount} funcionalidades`}
                            >
                              <span className="mr-2 text-purple-700 text-xs flex-shrink-0">f(x)</span>
                              <span className="text-sm font-medium flex-1 truncate">{baseFunction.name}</span>
                              <Chip
                                label={funcCount}
                                color="#f3e5f5"
                                textColor="#7b1fa2"
                                className="font-bold mr-1 flex-shrink-0"
                              />
                              <button
                                onClick={(e) => onOpenModal(
                                  baseFunction,
                                  group.name,
                                  capability.name,
                                  subCapability.name,
                                  e
                                )}
                                className="p-0.5 text-purple-700 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
                              >
                                <ExternalLink size={12} />
                              </button>
                            </div>
                          }
                          sx={{
                            ml: 1,
                            '& > .MuiTreeItem-content': {
                              padding: '4px 8px',
                              borderRadius: '4px',
                              borderLeft: '2px solid #7b1fa2',
                              '&:hover': { backgroundColor: '#f3e5f5' },
                              '&.Mui-selected': {
                                backgroundColor: '#7b1fa2 !important',
                                color: 'white',
                                '& span': { color: 'white' },
                                '& button': { color: 'white' },
                              },
                            },
                          }}
                        />
                      );
                    })}
                  </TreeItem>
                );
              })}
            </TreeItem>
          );
        }) || []
      )}
    </SimpleTreeView>
  );
}
