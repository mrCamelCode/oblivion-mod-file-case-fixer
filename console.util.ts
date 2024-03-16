export function write(str?: string, indentationLevel?: number) {
  console.log(`${'  '.repeat(indentationLevel ?? 0)}${str}`);
}

export function writeLine(str?: string, indentationLevel?: number) {
  write(`${str}\n`, indentationLevel);
}
