"use client"
export default function Chip({ name, style, onClick }:
    {
        name: string,
        style?: string,
        onClick?: () => void,
    }
) {
    return (
        <div
            onClick={onClick}
            className={`py-1 px-2 text-xs border border-gray-300 rounded-md cursor-pointer ${style ?? ''}`}>
            {name}
        </div>
    );
}