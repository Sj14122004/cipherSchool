import fs from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const COMPILATION_TIMEOUT = 5000;

export const compileJava = async (
  code,
  executionContract
) => {
  const {
    className,
  } = executionContract || {};

  if (!className) {
    return {
      passed: false,
      errors: [
        "Execution contract is missing className.",
      ],
      timedOut: false,
    };
  }

  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "lld-java-")
  );

  const filePath = path.join(
    tempDir,
    `${className}.java`
  );

  try {
    // Save student code
    await fs.writeFile(
      filePath,
      code,
      "utf8"
    );

    // Compile student code
    await execFileAsync(
      "javac",
      [filePath],
      {
        timeout: COMPILATION_TIMEOUT,
        windowsHide: true,
      }
    );

    return {
      passed: true,
      errors: [],
      timedOut: false,
    };
  } catch (error) {
    const timedOut =
      error.code === "ETIMEDOUT" ||
      error.killed === true;

    return {
      passed: false,
      errors: [
        timedOut
          ? "Java compilation timed out after 5 seconds."
          : error.stderr?.trim() ||
            error.stdout?.trim() ||
            error.message,
      ],
      timedOut,
    };
  } finally {
    // Remove temporary files
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};

export default compileJava;