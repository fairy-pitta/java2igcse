export class PseudocodeFormatter {
    format(pseudocode: string | string[]): string {
        // Convert array to string if necessary
        const code = Array.isArray(pseudocode) ? pseudocode.join('\n') : pseudocode;

        // Split into lines for processing
        const lines = code.split('\n');

        // Process each line
        const formattedLines = lines
            .map(line => line.trimEnd()) // Remove trailing whitespace
            .filter((line, index, array) => {
                // Keep non-empty lines
                if (line.trim().length > 0) return true;
                
                // Keep single empty line between non-empty lines
                const prevLine = array[index - 1] || '';
                const nextLine = array[index + 1] || '';
                return prevLine.trim().length > 0 && nextLine.trim().length > 0;
            });

        // Join lines and ensure single newline at end
        return formattedLines.join('\n') + '\n';
    }
}
