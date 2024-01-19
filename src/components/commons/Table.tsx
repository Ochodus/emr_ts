import { useMemo, forwardRef, useRef, useEffect } from "react";
import { useTable, useSortBy, useFlexLayout, useResizeColumns, useRowSelect } from "react-table";
import styles from './Table.module.css'
import classNames from 'classnames/bind';

export type TableHeader =
	({
		Header: string;
		accessor: string;
		width: number;
		Cell?: undefined;
	} | {
		Header: string;
		accessor: string;
		Cell: ({ row }: {
				row: any;
		}) => JSX.Element;
		width: number;
	})[]

interface TableProps {
	headers: TableHeader,
	items: any,
	table_width: string,
	useSelector?: boolean,
	addFunction?: (newPatient: any, isNew: boolean, id: number) => Promise<void>
}

interface IndeterminateCheckboxProps {
	indeterminate?: boolean;
}

export const Table = forwardRef<HTMLDivElement, TableProps>(({ 
	headers, 
	items, 
	table_width
}, ref) => { // items props 받기, default parameter 빈 배열로 설정
	const cx = classNames.bind(styles)

	const defaultColumn = useMemo(
		() => ({
			width: 30,
			minWidth: 30,
			maxWidth: 500
		}),
		[]
	)

	// // value 순서에 맞게 테이블 데이터를 출력하기 위한 배열
	// const headerKey = headers.map((header: any) => header.value);

	const { 
		getTableProps, 
		getTableBodyProps, 
		headerGroups, 
		rows, 
		prepareRow,
		state: { selectedRowIds },
	} = useTable(
		{ 
			columns: headers, 
			data: items ?? [], 
			defaultColumn 
		}, 
	);

	return (
		<div className={cx("scroller")}>
			<div className={cx("content")} style={{ width: table_width }}>
				<table className="table table-bordered table-hover dt-responsive" {...getTableProps()}>
					<thead>
						{headerGroups.map((headerGroup) => (
							<tr {...headerGroup.getHeaderGroupProps()}>
								{headerGroup.headers.map((column) => (
									<th {...column.getHeaderProps()}>{column.render("Header")}
										<div 
											//{...column.getSortByToggleProps()}
											className={`${cx("sorter")}`}
										/>
										<div
											//{...column.getResizerProps()}
											className={`${cx("resizer")} ${
												column.isResizing ? cx("isResizing") : ""
											}`}
										/>
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody {...getTableBodyProps()}>
						{rows.map((row, rowIndex) => {
							prepareRow(row);
							return (
								<tr {...row.getRowProps()}>
									{row.cells.map((cell, index) => (
										<td {...cell.getCellProps()}>{cell.render("Cell")}</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
});

export default Table;