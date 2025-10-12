import { useState, useCallback } from "react";
import * as Papa from "papaparse";

interface CsvState {
  fileName: string;
  data: {
    parsed: Record<string, unknown>[];
    mapped: Record<string, unknown>[];
  };
  fieldMappings: {
    original: Record<string, string | undefined>;
    current: Record<string, string | undefined>;
  };
  error: string | null;
}

interface UseParseCsvProps {
  /**
   * Array of field mappings defining the structure of the imported data.
   * Each field includes a label, value, and optional required flag.
   */
  fields: { label: string; value: string; required?: boolean }[];

  /**
   * Callback function invoked when data is successfully parsed.
   */
  onSuccess?: (data: Record<string, unknown>[]) => void;

  /**
   * Callback function invoked when an error occurs during parsing.
   */
  onError?: (message: string) => void;
}

export function useParseCsv({ fields, onSuccess, onError }: UseParseCsvProps) {
  const [csvState, setCsvState] = useState<CsvState>({
    fileName: "",
    data: {
      parsed: [],
      mapped: [],
    },
    fieldMappings: {
      current: {},
      original: {},
    },
    error: null,
  });

  const onParse = useCallback(
    ({ file, limit = Infinity }: { file: File; limit?: number }) => {
      let count = 0;
      const allResults: Record<string, unknown>[] = [];

      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        step: (results, parser) => {
          try {
            if (count === 0) {
              const mappings = (results.meta.fields ?? [])?.reduce(
                (acc, field) => ({
                  ...acc,
                  [field]: field,
                }),
                {}
              );

              setCsvState((prevState) => ({
                ...prevState,
                fieldMappings: {
                  original: mappings,
                  current: mappings,
                },
              }));
            }

            if (count < limit) {
              allResults.push(results.data);
              count++;
            } else {
              parser.abort();
              throw new Error(`Only ${limit} rows are allowed`);
            }
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "An error occurred";
            setCsvState((prevState) => ({ ...prevState, error: message }));
            onError?.(message);
          }
        },
        complete: (_, localFile: File) => {
          setCsvState((prevState) => ({
            ...prevState,
            fileName: localFile?.name
              ? localFile.name.replace(/\.[^/.]+$/, "")
              : "Untitled",
            data: {
              parsed: allResults,
              mapped: allResults,
            },
          }));
          onSuccess?.(allResults);
        },
      });
    },
    [onSuccess, onError]
  );

  const onFieldChange = useCallback(
    ({ oldValue, newValue }: { oldValue: string; newValue: string }) => {
      setCsvState((prevState) => ({
        ...prevState,
        fieldMappings: {
          ...prevState.fieldMappings,
          current: { ...prevState.fieldMappings.current, [newValue]: oldValue },
        },
        data: {
          ...prevState.data,
          mapped: prevState.data.mapped.map((row, index) => ({
            ...row,
            [newValue]: prevState.data.parsed[index]?.[oldValue],
          })),
        },
      }));
    },
    []
  );

  const onFieldToggle = useCallback(
    ({ value, checked }: { value: string; checked: boolean }) => {
      setCsvState((prevState) => ({
        ...prevState,
        fieldMappings: {
          ...prevState.fieldMappings,
          current: {
            ...prevState.fieldMappings.current,
            [value]: checked ? "" : undefined,
          },
        },
        data: {
          ...prevState.data,
          mapped: prevState.data.mapped.map((row) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [value]: _, ...rest } = row;
            return rest;
          }),
        },
      }));
    },
    []
  );

  const onFieldsReset = useCallback(() => {
    setCsvState((prevState) => ({
      ...prevState,
      fieldMappings: {
        ...prevState.fieldMappings,
        current: prevState.fieldMappings.original,
      },
      data: {
        ...prevState.data,
        mapped: prevState.data.parsed,
      },
    }));
  }, []);

  const getSanitizedData = useCallback(
    ({ data }: { data: Record<string, unknown>[] }) => {
      return data.map((row) =>
        Object.keys(row).reduce(
          (acc, key) => ({
            ...acc,
            [key]: row[key] === null ? "" : row[key],
          }),
          {}
        )
      );
    },
    []
  );

  return {
    fileName: csvState.fileName,
    data: csvState.data.mapped,
    fieldMappings: csvState.fieldMappings,
    error: csvState.error,
    getSanitizedData,
    onParse,
    onFieldChange,
    onFieldToggle,
    onFieldsReset,
  };
}

