"use client";

import { useMemo, useState } from "react";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxTagLength?: number;
  placeholder?: string;
}

export default function TagInput({
  value,
  onChange,
  maxTags = 10,
  maxTagLength = 30,
  placeholder = "Type a tag and press Enter",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const normalizedTags = useMemo(
    () => value.map((tag) => tag.trim().toLowerCase()),
    [value],
  );

  const addTag = (rawValue: string) => {
    const trimmed = rawValue.trim();

    if (!trimmed) return;

    if (value.length >= maxTags) {
      setErrorText(`Maximum ${maxTags} tags allowed.`);
      return;
    }

    if (trimmed.length > maxTagLength) {
      setErrorText(`Each tag can be at most ${maxTagLength} characters.`);
      return;
    }

    const normalized = trimmed.toLowerCase();

    if (normalizedTags.includes(normalized)) {
      setErrorText("Duplicate tags are not allowed.");
      return;
    }

    onChange([...value, normalized]);
    setInputValue("");
    setErrorText(null);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setErrorText(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag, idx) => (
          <Chip
            key={`${tag}-${idx}`}
            color="primary"
            variant="flat"
            isCloseable
            onClose={() => removeTag(idx)}
          >
            {tag}
          </Chip>
        ))}
      </div>

      <Input
        size="sm"
        value={inputValue}
        placeholder={placeholder}
        onValueChange={(nextValue) => {
          setInputValue(nextValue);
          if (errorText) setErrorText(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(inputValue);
          }

          if (
            event.key === "Backspace" &&
            inputValue.trim().length === 0 &&
            value.length > 0
          ) {
            removeTag(value.length - 1);
          }
        }}
        onBlur={() => addTag(inputValue)}
        isInvalid={!!errorText}
        errorMessage={errorText ?? undefined}
      />

      <p className="text-xs text-gray-500">
        {value.length}/{maxTags} tags • max {maxTagLength} characters each
      </p>
    </div>
  );
}
