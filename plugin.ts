import type { Plugin } from 'vite';
import fs from 'node:fs';
import { parseImports } from 'parse-imports';
import * as Icon from 'lucide-react';
import dice from 'fast-dice-coefficient';

const validIconsList = Object.keys(Icon).filter(([char]) => isUppercase(char));
const validIcons: Set<string> = new Set(validIconsList);

const virtualPrefix = 'lucide-react-fuzzy:';
const specifierLookup: Record<string, string[]> = {};
let modCount = 0;

export default function lucideReactFuzzy(): Plugin {
    return {
        name: 'vite-plugin-lucide-react-fuzzy',
        enforce: 'pre',
        async resolveId(id, path) {
            if (!path || path.startsWith(virtualPrefix)) {
                return null;
            }

            if (id === 'lucide-react') {
                const source = await fs.promises.readFile(path, 'utf8');
                const imports = await parseImports(source);

                const iconNames: string[] = [];

                for (const $import of imports) {
                    if ($import.moduleSpecifier.value === id) {
                        $import.importClause?.named.forEach(({ specifier }) => {
                            iconNames.push(specifier);
                        });
                    }
                }

                specifierLookup[path] = iconNames;

                return `${virtualPrefix}${path}|${modCount++}`;
            }

            return null;
        },
        load(id) {
            if (!id.startsWith(virtualPrefix)) return null;

            const splitIndex = id.lastIndexOf('|');
            const realId = id.slice(virtualPrefix.length, splitIndex);
            const imports = specifierLookup[realId] ?? [];

            const originalImports: string[] = [];
            const fuzzyLookup = {};

            imports.forEach((name) => {
                if (validIcons.has(name) || !isUppercase(name[0])) {
                    originalImports.push(name);
                } else {
                    const nearest = findNearestValidIcon(name);
                    fuzzyLookup[name] = nearest;
                    originalImports.push(nearest);
                }
            });

            const importList =
                originalImports.length > 0
                    ? `import { ${uniq(originalImports).join(
                          ', ',
                      )} } from 'lucide-react';`
                    : '';

            const exportList = uniq(imports)
                .map((name) => {
                    if (fuzzyLookup[name]) {
                        return `export const ${name} = ${fuzzyLookup[name]};`;
                    }

                    return `export { ${name} };`;
                })
                .join('\n');

            return `export * from 'lucide-react';\n${importList}\n${exportList}`;
        },
        buildEnd() {
            Object.keys(specifierLookup).forEach(
                (key) => delete specifierLookup[key],
            );
        },
    };
}

function isUppercase(char: string) {
    return char >= 'A' && char <= 'Z';
}

function findNearestValidIcon(name: string): string {
    return validIconsList
        .map((iconName) => {
            const value = dice(iconName, name);
            return { value, iconName };
        })
        .sort((a, b) => b.value - a.value)[0].iconName;
}

function uniq(list: string[]): string[] {
    return list.filter((datum, index, arr) => arr.indexOf(datum) === index);
}
