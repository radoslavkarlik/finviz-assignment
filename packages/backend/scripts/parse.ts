import { XMLParser } from "fast-xml-parser";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface SynsetNode {
  "@_words": string;
  synset?: SynsetNode | SynsetNode[];
}

interface ImageNetXml {
  ImageNetStructure: {
    synset: SynsetNode;
  };
}

interface Entry {
  name: string;
  size: number;
}

function countDescendants(node: SynsetNode): number {
  const children = node.synset ? (Array.isArray(node.synset) ? node.synset : [node.synset]) : [];
  return children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
}

function flatten(node: SynsetNode, prefix: string): Entry[] {
  const name = prefix ? `${prefix} > ${node["@_words"]}` : node["@_words"];
  const children = node.synset ? (Array.isArray(node.synset) ? node.synset : [node.synset]) : [];

  const entries: Entry[] = [{ name, size: countDescendants(node) }];
  for (const child of children) {
    entries.push(...flatten(child, name));
  }
  return entries;
}

const xml = readFileSync(join(__dirname, "structure_released.xml"), "utf-8");
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: false,
});
const parsed = parser.parse(xml) as ImageNetXml;

const root = parsed.ImageNetStructure.synset;
const entries = flatten(root, "");

writeFileSync(join(__dirname, "..", "parsed.json"), JSON.stringify(entries, null, 2));
console.log(`Parsed ${entries.length} entries`);
