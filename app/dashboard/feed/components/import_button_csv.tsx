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
import { Feedback } from '@/constants/app_type';

export function ImportButtonCsv({ ref }: { ref?: React.Ref<HTMLInputElement> }) {
    const [isParsing, setIsParsing] = useState(false);
    const { mutate, isPending, isSuccess } = useAddFeedback();
    const { addToast } = useToastStore();

    const handleGenerateLog = (message: string) => {
        const logs = message.split('\n');
        generateErrorLog(logs);
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const text = await file.text();
        const rawData = parseCSV(text);

        console.log('Raw Data', rawData);

        const data: Feedback[] = rawData.map((row, i) => {
            return {
                content: row['Feedback Content'],
                source: row['Source'],
                customer_email: row['Customer Email'],
            };

        });

        // Send to our mutation
        mutate(data, {
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

    return (
        <Input
            ref={ref}
            type="file"
            accept=".csv"
            className="hidden"
            id="csv-upload"
            onChange={handleFileUpload}
            disabled={isPending || isParsing}
        />
    );
}

export const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    // 1. Get Headers and normalize them
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // 2. Parse Rows (handling potential commas inside quotes)
    return lines.slice(1).filter(line => line.trim()).map(line => {
        // This regex splits by comma but ignores commas inside double quotes
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

        if (!values) return null;

        const entry: any = {};
        headers.forEach((header, index) => {
            let val = values[index]?.trim() || "";
            // Remove surrounding quotes if they exist
            entry[header] = val.replace(/^"|"$/g, '');
        });
        return entry;
    }).filter(Boolean);
};