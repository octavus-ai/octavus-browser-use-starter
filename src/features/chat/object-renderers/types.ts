import type { ComponentType } from 'react';
import type { UIObjectPart } from '@octavus/react';

export interface ObjectRendererProps {
  part: UIObjectPart;
  /** Called when user clicks a suggestion chip */
  onSuggestionClick?: (suggestion: string) => void;
}

export type ObjectRenderer = ComponentType<ObjectRendererProps>;

export type ObjectRendererRegistry = Record<string, ObjectRenderer>;
