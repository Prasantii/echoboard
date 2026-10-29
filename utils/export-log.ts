export const generateErrorLog = (errors: string[]) => {
  // 1. Create the file content
  const header = `ECHOBOARD IMPORT ERROR LOG\nGenerated: ${new Date().toLocaleString()}\n`;
  const divider = `------------------------------------------\n`;
  const content = errors.join('\n');

  const fullText = `${header}${divider}${content}`;

  // 2. Create a Blob (Binary Large Object) of type plain text
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });

  // 3. Trigger Download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `import_errors_${new Date().getTime()}.txt`;

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};