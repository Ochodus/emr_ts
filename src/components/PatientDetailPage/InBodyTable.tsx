import { useMemo, forwardRef } from "react";
import { useTable } from "react-table";
import styles from './InBodyTable.module.css'
import classNames from 'classnames/bind';

interface InBodyTableProps {
  children?: React.ReactNode,
  headers?: any,
  items: any,
  onSelectedRowIdsChange?: () => void,
  table_width?: number,
  useSelector: boolean
}

export const InBodyTable = forwardRef(({ headers, items = [], onSelectedRowIdsChange, table_width, useSelector}: InBodyTableProps, ref) => { // items props 받기, default parameter 빈 배열로 설정
  if (!headers || !headers.length) {
    throw new Error("<DataTable /> headers is required.");
  }

  const defaultColumn = useMemo(
    () => ({
      width: 30,
      minWidth: 30,
      maxWidth: 500
    }),
    []
  )

  const cx = classNames.bind(styles);

  const { 
    getTableProps, 
    getTableBodyProps, 
    headerGroups, 
    rows, 
    prepareRow,
  } = useTable(
    { 
      columns: headers, 
      data: items, 
      defaultColumn 
    }
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
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, row_index) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell, col_index) => {
                    let isRowCol = row_index == 0 && col_index >=2
                    let isColCol = col_index == 2 && row_index != 0
                    let isMerged = !(row_index == 0 || col_index <= 2)

                    return (
                      isMerged ? "" :
                      <td {...cell.getCellProps()}
                        rowSpan={isRowCol ? col_index-1 : undefined}
                        colSpan={isColCol ? row_index+1 : undefined}
                        style={
                          isRowCol ? { borderLeft: "0px" } : col_index==0 ? { backgroundColor: "lightGray"} : undefined
                        }
                      >
                        {cell.render("Cell")}
                      </td>
                    )}
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default InBodyTable;