import { Converter } from "opencc-js/cn2t";
import { readTextFile, writeTextFile, readDir } from "@tauri-apps/plugin-fs";
import { join, dirname } from "@tauri-apps/api/path";

const S2T_CONVERTER = Converter({ from: "cn", to: "t" });

const CONVERTIBLE_EXTENSIONS = [".srt", ".vtt", ".txt", ".tsv", ".json"];

export async function convertOutputToTraditional(
  outputDir: string | null,
  audioPath: string
): Promise<{ converted: string[]; skipped: string[] }> {
  const dir = outputDir || await dirname(audioPath);
  const converted: string[] = [];
  const skipped: string[] = [];

  let entries;
  try {
    entries = await readDir(dir);
  } catch {
    return { converted: [], skipped: [] };
  }

  for (const entry of entries) {
    const name = entry.name;
    const dotIndex = name.lastIndexOf(".");
    const ext = dotIndex >= 0 ? name.substring(dotIndex).toLowerCase() : "";
    if (!CONVERTIBLE_EXTENSIONS.includes(ext)) {
      skipped.push(name);
      continue;
    }

    const filePath = await join(dir, name);
    let content: string;
    try {
      content = await readTextFile(filePath);
    } catch {
      skipped.push(name);
      continue;
    }

    const hasChinese = /[\u4e00-\u9fff]/.test(content);
    if (!hasChinese) {
      skipped.push(name);
      continue;
    }

    const convertedContent = S2T_CONVERTER(content);

    try {
      await writeTextFile(filePath, convertedContent);
      converted.push(name);
    } catch {
      skipped.push(name);
    }
  }

  return { converted, skipped };
}