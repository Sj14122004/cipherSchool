import fs from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const TEST_TIMEOUT = 5000;

const escapeJavaString = (value) => {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n");
};

const normalizeOutput = (output) => {
  return output
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const createRunnerCode = (
  className,
  methodName,
  commands
) => {
  const calls = commands
    .map(
      (command) =>
        `System.out.println(solution.${methodName}("${escapeJavaString(command)}"));`
    )
    .join("\n        ");

  return `
public class TestRunner {

    public static void main(String[] args) {

        ${className} solution = new ${className}();

        ${calls}
    }
}
`;
};

export const runJavaTests = async (
  code,
  testCases = [],
  executionContract = {}
) => {
  const {
    className,
    methodName,
  } = executionContract;

  if (!className || !methodName) {
    return {
      passed: false,
      status: "FAIL",
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      coverage: 0,
      tests: [],
      error:
        "Execution contract is missing className or methodName.",
    };
  }

  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "lld-java-tests-")
  );

  const studentFile = path.join(
    tempDir,
    `${className}.java`
  );

  const runnerFile = path.join(
    tempDir,
    "TestRunner.java"
  );

  try {
    // Save student code
    await fs.writeFile(
      studentFile,
      code,
      "utf8"
    );

    const results = [];

    for (const testCase of testCases) {
      const commands = testCase.commands || [];

      const expected = normalizeOutput(
        (testCase.expectedOutput || []).join("\n")
      );

      const runnerCode = createRunnerCode(
        className,
        methodName,
        commands
      );

      await fs.writeFile(
        runnerFile,
        runnerCode,
        "utf8"
      );

      try {
        // Compile student code and runner
        await execFileAsync(
          "javac",
          [
            studentFile,
            runnerFile,
          ],
          {
            timeout: TEST_TIMEOUT,
            windowsHide: true,
          }
        );

        // Run this test case with fresh state
        const result = await execFileAsync(
          "java",
          [
            "-cp",
            tempDir,
            "TestRunner",
          ],
          {
            timeout: TEST_TIMEOUT,
            windowsHide: true,
            maxBuffer: 1024 * 1024,
          }
        );

        const actual = normalizeOutput(
          result.stdout || ""
        );

        const passed =
          JSON.stringify(actual) ===
          JSON.stringify(expected);

        results.push({
          name: testCase.name,
          passed,
          expected,
          actual,
        });
      } catch (error) {
        results.push({
          name: testCase.name,
          passed: false,
          expected,
          actual: [],
          error:
            error.stderr?.trim() ||
            error.stdout?.trim() ||
            error.message,
          timedOut:
            error.code === "ETIMEDOUT" ||
            error.killed === true,
        });
      }
    }

    const totalTests = results.length;

    const passedTests = results.filter(
      (test) => test.passed
    ).length;

    const failedTests =
      totalTests - passedTests;

    const coverage =
      totalTests === 0
        ? 0
        : Math.round(
            (passedTests / totalTests) * 100
          );

    let status = "FAIL";

    if (coverage === 100) {
      status = "PASS";
    } else if (coverage > 0) {
      status = "PARTIAL";
    }

    return {
      passed: status === "PASS",
      status,
      totalTests,
      passedTests,
      failedTests,
      coverage,
      tests: results,
    };
  } catch (error) {
    return {
      passed: false,
      status: "FAIL",
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: testCases.length,
      coverage: 0,
      tests: [],
      compilationFailed: true,
      error:
        error.stderr?.trim() ||
        error.stdout?.trim() ||
        error.message,
    };
  } finally {
    // Remove temporary files
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};

export default runJavaTests;