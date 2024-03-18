function formatCppCode(code: string): string {
    let indentLevel = 0;
    let formattedCode = "";
    for (const line of code.split(/\){\n*/).join("\){\n").split("\n")) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            if (trimmedLine.endsWith("{") && trimmedLine.length > 1) {
                formattedCode += " ".repeat(indentLevel) + trimmedLine.slice(0, trimmedLine.length - 1) + '\n';
                formattedCode += " ".repeat(indentLevel) + '{\n';
                indentLevel += 2;
            }
            else if (trimmedLine.endsWith("{")) {
                formattedCode += " ".repeat(indentLevel) + '{\n';
                indentLevel += 2;
            }
            else if (trimmedLine.endsWith("}") && trimmedLine.length > 1) {
                formattedCode += " ".repeat(indentLevel) + trimmedLine.slice(0, trimmedLine.length - 1) + '\n';
                indentLevel -= 2;
                indentLevel = Math.max(indentLevel,0);
                formattedCode += " ".repeat(indentLevel) + '}\n';
            }
            else if (trimmedLine.endsWith("}")) {
                indentLevel -= 2;
                indentLevel = Math.max(indentLevel,0);
                formattedCode += " ".repeat(indentLevel) + '}\n';
            }
            // else if (trimmedLine.endsWith("for") || trimmedLine.endsWith("while") || trimmedLine.endsWith("if") || trimmedLine.endsWith("else")) {
            //     formattedCode += " ".repeat(indentLevel) + trimmedLine + "\n";
            // }
            else {
                formattedCode += " ".repeat(indentLevel) + trimmedLine + "\n";
            }
        } else {
            formattedCode += "\n";
        }
    }
    let ans = formattedCode.split('\n');
    while (ans.length) {
        if (ans[ans.length - 1] === '') ans.pop();
        else return ans.join('\n');
    }
    return '';
}

export default formatCppCode;
