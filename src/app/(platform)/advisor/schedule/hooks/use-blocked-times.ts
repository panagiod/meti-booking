import { useState, useCallback } from "react";
import { useDialog } from "@/hooks/use-dialog";
import { BlockedTime } from "../utils/schedule-utils";

export function useBlockedTimes() {
  const dialog = useDialog();
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");

  const loadBlockedTimes = useCallback(async () => {
    try {
      const res = await fetch("/api/advisor/blocked-times", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBlockedTimes(data.blockedTimes || []);
      }
    } catch (error) {
      console.error("Error loading blocked times:", error);
    }
  }, []);

  const createBlock = useCallback(async () => {
    if (!blockTitle.trim()) {
      dialog.showAlert("Required field", "Title is required", "warning");
      return;
    }

    try {
      const res = await fetch("/api/advisor/blocked-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: blockTitle,
          startDate: new Date(blockStartDate).toISOString(),
          endDate: new Date(blockEndDate).toISOString(),
          isAllDay: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBlockedTimes((prev) => [...prev, data.blockedTime]);
        setShowModal(false);
        resetForm();
        dialog.showAlert("Success", "Time slot blocked", "success");
      }
    } catch (error) {
      dialog.showAlert("Error", "Connection error", "error");
    }
  }, [blockTitle, blockStartDate, blockEndDate, dialog]);

  const deleteBlock = useCallback(async (id: string) => {
    const confirmed = await dialog.showConfirm(
      "Remove block",
      "Are you sure you want to remove this block?",
      "warning"
    );

    if (confirmed) {
      try {
        await fetch(`/api/advisor/blocked-times?id=${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setBlockedTimes((prev) => prev.filter((bt) => bt.id !== id));
        dialog.showAlert("Success", "Block removed", "success");
      } catch (error) {
        dialog.showAlert("Error", "Failed to delete", "error");
      }
    }
  }, [dialog]);

  const resetForm = useCallback(() => {
    setBlockTitle("");
    setBlockStartDate("");
    setBlockEndDate("");
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  return {
    blockedTimes,
    showModal,
    blockTitle,
    blockStartDate,
    blockEndDate,
    loadBlockedTimes,
    createBlock,
    deleteBlock,
    openModal,
    closeModal,
    setBlockTitle,
    setBlockStartDate,
    setBlockEndDate,
  };
}
