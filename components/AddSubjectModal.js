import React from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AddSubjectModal = ({ open, onClose, onSave, subjectName, setSubjectName }) => {
  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true"></div>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-50">
        <Dialog.Title className="text-lg font-semibold mb-4">Add New Subject</Dialog.Title>
        <div className="space-y-4">
          {/* Input Field */}
          <Input
            type="text"
            placeholder="Enter subject name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter" && subjectName.trim()) {
                onSave();
              }
            }}
          />
        </div>
        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!subjectName.trim()}>
            Add Subject
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default AddSubjectModal;
