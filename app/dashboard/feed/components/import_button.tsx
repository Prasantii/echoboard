'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// import { useImportFeedback } from '@/infrastructure/hooks/use-import-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { useAddFeedback } from '../hook/use-add-feedback';
import { useToastStore } from '@/store/toast.store';
import { generateErrorLog } from '@/utils/export-log';

export function ImportButton({ ref }: { ref?: React.Ref<HTMLInputElement> }) {
    const [isParsing, setIsParsing] = useState(false);
    const { mutate, isPending, isSuccess } = useAddFeedback();
    const { addToast } = useToastStore();

    const handleGenerateLog = (message: string) => {
        const logs = message.split('\n');
        generateErrorLog(logs);
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const json = XLSX.utils.sheet_to_json(worksheet);

            // Send to our mutation
            mutate(json, {
                onSettled: () => {
                    setIsParsing(false)
                },
                onSuccess: () => {
                    addToast({
                        id: window.crypto.randomUUID(),
                        type: 'success',
                        message: "Data added successfully!",
                    });
                },
                onError: (e) => {
                    addToast({
                        id: window.crypto.randomUUID(),
                        type: 'error',
                        message: "Error importing file, check log file below",
                        button: (<Button variant='outline' onClick={() => handleGenerateLog(e.message)}>Log</Button>)
                    })
                }
            });
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <Input
            ref={ref}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            id="excel-upload"
            onChange={handleFileUpload}
            disabled={isPending || isParsing}
        />
    );
}