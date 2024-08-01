import * as React from 'react';
import { Checkbox, Link, Sheet, Table } from '@mui/joy';
import { ArrowDropDown } from '@mui/icons-material';


export interface ID {
	id: number
}

export interface HeadCellWithSingleId<T> {
	id: keyof T;
	label: string;
	numeric: boolean;
	sortable?: boolean;
	parse?: (value: T[keyof T]) => string | number | React.ReactElement;
}

export interface HeadCellWithMultipleId<T> {
	id: (keyof T)[];
	label: string;
	numeric: boolean;
	sortable?: boolean;
	parse: (value: T[keyof T][]) => string | number | React.ReactElement;
}

export type HeadCell<T> = HeadCellWithSingleId<T> | HeadCellWithMultipleId<T>

const isHeadCellWithSingleId = <T,>(cell: HeadCell<T>): cell is HeadCellWithSingleId<T> => {
	return !Array.isArray(cell.id)
}

// const isHeadCellWithMultipleId = <T,>(cell: HeadCell<T>): cell is HeadCellWithMultipleId<T> => {
// 	return Array.isArray(cell.id)
// }

type TableProps<T> = SortableTableProps<T> | UnsortableTableProps<T>

interface BaseTableProps<T> {
	headCells: HeadCell<T>[], 
	rows: T[],
	selectable?: boolean,
	defaultRowNumber?: number
}

interface SortableTableProps<T> extends BaseTableProps<T> {
	selectable?: true,
	selected: number[],
	setSelected: React.Dispatch<React.SetStateAction<number[]>>
}

interface UnsortableTableProps<T> extends BaseTableProps<T> {
	selectable?: false,
	selected?: number[],
	setSelected?: React.Dispatch<React.SetStateAction<number[]>>
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}
	
type Order = 'asc' | 'desc';
	
function getComparator<T, Key extends keyof T>(
	order: Order,
	orderBy: Key,
): (
	a: T,
	b: T,
) => number {
	return order === 'desc'
	? (a, b) => descendingComparator(a, b, orderBy)
	: (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
	stabilizedThis.sort((a, b) => {
	const order = comparator(a[0], b[0]);
	if (order !== 0) {
		return order;
	}
	return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

export const TableMui = <T extends ID>({
	headCells, 
	rows, 
	selected, 
	defaultRowNumber=7,
	selectable=true,
	setSelected
}: TableProps<T>) => {
	const [order, setOrder] = React.useState<Order>('desc');
	const [sortBy, setSortBy] = React.useState<keyof T>('id')

	return (
		<Sheet
			className="OrderTableContainer"
			sx={{
				display: { xs: 'none', sm: 'initial' },
				flexShrink: 1,
				overflowY: 'auto',
				'&::-webkit-scrollbar': {
					height: '10px'  
				},
				'&::-webkit-scrollbar-thumb': {
					background: 'rgba(110, 162, 213)',
					borderRadius: '10px'
				},
				'&::-webkit-scrollbar-track': {
					background: 'rgba(110, 162, 213, .1)'
				}
			}}
		>
			<Table
				aria-labelledby="tableTitle"
				stickyHeader
				hoverRow
				sx={{
					'--TableCell-headBackground': 'var(--joy-palette-background-level1)',
					'--Table-headerUnderlineThickness': '1px',
					'--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
					'--TableCell-paddingY': '4px',
					'--TableCell-paddingX': '8px',
				}}
			>
			<thead>
				<tr>
					{selectable && selected && setSelected ? 
					<th style={{ 
						width: '47px', 
						textAlign: 'center', 
						verticalAlign: 'middle',
						borderBottom: '0.0625rem solid hsl(212deg 17.56% 72.48%)'
					}}>
						<Checkbox
							size="sm"
							indeterminate={
								selected.length > 0 && selected.length !== rows.length
							}
							checked={selected.length === rows.length}
							onChange={(event) => {
								setSelected(event.target.checked ? rows.map((row) => row.id) : []);
							}}
							color={
								selected.length > 0 || selected.length === rows.length
								? 'primary'
								: undefined
							}
							sx={{ verticalAlign: 'text-bottom' }}
						/>
					</th> : null}
					{headCells.map((headCell, index) => {
						return (
							<th style={{ 
									textAlign: 'center', 
									verticalAlign: 'middle',
									borderBottom: '0.0625rem solid hsl(212deg 17.56% 72.48%)'
								}} key={index}
							>
								{headCell.sortable ? <Link
									underline="none"
									component="button"
									onClick={() => {
										setOrder(order === 'asc' ? 'desc' : 'asc')
										setSortBy(isHeadCellWithSingleId(headCell) ? headCell.id : headCell.id[0])
									}}
									fontWeight="lg"
									endDecorator={<ArrowDropDown />}
									sx={{
										'& svg': {
										transition: '0.2s',
										transform:
											sortBy === (isHeadCellWithSingleId(headCell) ? headCell.id : headCell.id[0]) ? order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)' : 'rotate(90deg)',
										},
										justifyContent: 'center',
										margin: 'auto'
									}}
								>
									{headCell.label}
								</Link> : headCell.label}
							</th>
						)
					})}
				</tr>
			</thead>
			<tbody>
				{stableSort(rows, getComparator<T, keyof T>(order, sortBy)).map((row) => (
					<tr key={row.id} style={{}}>
						{selectable && selected && setSelected ?
						<td style={{ textAlign: 'center', width: 120, backgroundColor: "#ffffff" }}>
							<Checkbox
								size="sm"
								checked={selected.includes(row.id)}
								color={selected.includes(row.id) ? 'primary' : undefined}
								onChange={(event) => {
									setSelected((ids) =>
										event.target.checked
										? ids.concat(row.id)
										: ids.filter((itemId) => itemId !== row.id)
									)
								}}
								slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
								sx={{ verticalAlign: 'text-bottom' }}
							/>
						</td> : null}
						{headCells.map((headCell, index) => {
							return (
								<td key={index} style={{ 
									backgroundColor: "#ffffff",
									textAlign: 'center',
								}}> 
									{
										isHeadCellWithSingleId(headCell) ? (
											headCell.parse ? headCell.parse(row[headCell.id]) 
											: (React.isValidElement(row[headCell.id]) ? 
												row[headCell.id] as React.ReactNode : row[headCell.id]?.toString()
											)
										)
										: headCell.parse(headCell.id.map((id) => row[id]))
									}
								</td>
							)
						})}
					</tr>
				))}
				{rows.length < defaultRowNumber ? Array.from({ length: defaultRowNumber - rows.length}, (_, index) => {
					return (
						<tr key={rows.length + index}>
							<td style={{ textAlign: 'center', width: 120, backgroundColor: "#ffffff" }}>
							</td>
							{headCells.map((_, index) => {
								return (
									<td key={index} style={{ backgroundColor: "#ffffff" }}>
									</td>
								)
							})}
						</tr>
					)
				}) : null}
			</tbody>
			</Table>
		</Sheet>
	)}

	export default TableMui
