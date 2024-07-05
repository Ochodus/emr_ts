import * as React from 'react';
import { Checkbox, Divider, Dropdown, IconButton, Link, Menu, MenuButton, MenuItem, Sheet, Table, Typography } from '@mui/joy';
import { ArrowDropDown, MoreHorizRounded, SwapVert } from '@mui/icons-material';


export interface ID {
	[index: string]: number,
	id: number
}

export interface HeadCell<T> {
	id: keyof T;
	label: string;
	numeric: boolean;
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
	
function getComparator<Key extends keyof any>(
	order: Order,
	orderBy: Key,
): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string },
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

export const TableMui = <T extends ID>({headCells, rows}: {headCells: HeadCell<T>[], rows: T[]}) => {
	const [order, setOrder] = React.useState<Order>('desc');
	const [sortBy, setSortBy] = React.useState('id')
	const [selected, setSelected] = React.useState<readonly number[]>([]);

	return (
		<Sheet
			className="OrderTableContainer"
			sx={{
				display: { xs: 'none', sm: 'initial' },
				width: '100%',
				borderRadius: 'sm',
				flexShrink: 1,
				overflow: 'auto',
				minHeight: 0,
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
					<th style={{ width: '47px', textAlign: 'center', padding: '12px 6px' }}>
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
					</th>
					{headCells.map((headCell, index) => {
						return (
							<th style={{ padding: '12px 6px', textAlign: 'center' }} key={index}>
								<Link
									underline="none"
									component="button"
									onClick={() => {
										setOrder(order === 'asc' ? 'desc' : 'asc')
										setSortBy(headCell.id.toString())
									}}
									fontWeight="lg"
									endDecorator={<ArrowDropDown />}
									sx={{
										'& svg': {
										transition: '0.2s',
										transform:
											sortBy === headCell.id.toString() ? order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)' : 'rotate(90deg)',
										},
										justifyContent: 'center',
										margin: 'auto'
									}}
								>
									{headCell.label}
								</Link>
							</th>
						)
					})}
				</tr>
			</thead>
			<tbody>
				{stableSort(rows, getComparator(order, sortBy)).map((row) => (
					<tr key={row.id}>
						<td style={{ textAlign: 'center', width: 120 }}>
							<Checkbox
								size="sm"
								checked={selected.includes(row.id)}
								color={selected.includes(row.id) ? 'primary' : undefined}
								onChange={(event) => {
								setSelected((ids) =>
									event.target.checked
									? ids.concat(row.id)
									: ids.filter((itemId) => itemId !== row.id),
								);
								}}
								slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
								sx={{ verticalAlign: 'text-bottom' }}
							/>
						</td>
						{headCells.map((headCell, index) => {
							return (
								<td key={index}>
									<Typography level="body-xs">{row[headCell.id].toString()}</Typography>
								</td>
							)
						})}
					</tr>
				))}
			</tbody>
			</Table>
		</Sheet>
	)}

	export default TableMui
