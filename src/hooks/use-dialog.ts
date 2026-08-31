"use client";

import { useState, useCallback } from "react";

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  type: "alert" | "confirm" | "prompt";
  variant: "info" | "success" | "warning" | "error";
  onConfirm?: () => void;
  inputValue?: string;
}

const defaultState: DialogState = {
  open: false,
  title: "",
  message: "",
  type: "alert",
  variant: "info",
};

export function useDialog() {
  const [state, setState] = useState<DialogState>(defaultState);
  const [inputValue, setInputValue] = useState("");

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      variant: "info" | "success" | "warning" | "error" = "info"
    ) => {
      return new Promise<void>((resolve) => {
        setState({
          open: true,
          title,
          message,
          type: "alert",
          variant,
          onConfirm: () => {
            setState(defaultState);
            resolve();
          },
        });
      });
    },
    []
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      variant: "info" | "warning" | "error" = "warning"
    ) => {
      return new Promise<boolean>((resolve) => {
        setState({
          open: true,
          title,
          message,
          type: "confirm",
          variant,
          onConfirm: () => {
            setState(defaultState);
            resolve(true);
          },
        });
      });
    },
    []
  );

  const showPrompt = useCallback(
    (title: string, message: string) => {
      return new Promise<string | null>((resolve) => {
        setInputValue("");
        setState({
          open: true,
          title,
          message,
          type: "prompt",
          variant: "info",
          onConfirm: () => {
            const value = inputValue;
            setState(defaultState);
            resolve(value || null);
          },
        });
      });
    },
    [inputValue]
  );

  const close = useCallback(() => {
    setState(defaultState);
    setInputValue("");
  }, []);

  return {
    ...state,
    inputValue,
    setInputValue,
    showAlert,
    showConfirm,
    showPrompt,
    close,
  };
}
