import React from "react";

export interface TableColumn<T>{
    key: keyof T;
    header: string;
    render?: ( value: any, row: T) => React.ReactNode;
}

export interface TableProps<T>{
    columns: TableColumn<T>[];
    data: T[];
}

export function Table<T>({ columns, data}: TableProps<T>) {
    return (
        <div className="table-responsive">
            <table className=" table align-middle">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={String(col.key)}>{col.header}</th>     
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx}>
                            {columns.map(col => (
                                <td key={String(col.key)}>
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}

                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
