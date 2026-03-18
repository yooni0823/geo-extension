import type { JsonLdBlockAnalysis } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function addSchemaType(target: Set<string>, typeValue: unknown) {
  if (typeof typeValue === "string" && typeValue.trim()) {
    target.add(typeValue.trim());
    return;
  }

  if (Array.isArray(typeValue)) {
    for (const item of typeValue) {
      if (typeof item === "string" && item.trim()) {
        target.add(item.trim());
      }
    }
  }
}

function collectSchemaTypes(node: unknown, target: Set<string>) {
  if (Array.isArray(node)) {
    for (const entry of node) {
      collectSchemaTypes(entry, target);
    }

    return;
  }

  if (!isRecord(node)) {
    return;
  }

  addSchemaType(target, node["@type"]);

  if (Array.isArray(node["@graph"])) {
    collectSchemaTypes(node["@graph"], target);
  }
}

export function detectSchemaTypes(value: unknown): string[] {
  const schemaTypes = new Set<string>();
  collectSchemaTypes(value, schemaTypes);
  return Array.from(schemaTypes);
}

export function parseJsonLdBlock(raw: string, index: number): JsonLdBlockAnalysis {
  try {
    const parsed = JSON.parse(raw) as unknown;

    return {
      index,
      raw,
      parsed,
      schemaTypes: detectSchemaTypes(parsed),
      parseError: null
    };
  } catch (error) {
    return {
      index,
      raw,
      parsed: null,
      schemaTypes: [],
      parseError: error instanceof Error ? error.message : "Unknown parse error."
    };
  }
}

export function analyzeJsonLdBlocks(blocks: string[]): JsonLdBlockAnalysis[] {
  return blocks.map((block, index) => parseJsonLdBlock(block, index));
}
