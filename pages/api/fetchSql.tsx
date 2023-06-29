import mysql from 'mysql2/promise';
import moment from "moment-timezone";

import { sqlQuery } from '../../components/sql/sqlQuery';

export default async function handler(req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { data?: mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader; error?: any; }): void; new(): any; }; }; }){
  const db = await mysql.createConnection({
    host     : process.env.SQL_HOSTNAME,
    port     : process.env.SQL_HOSTPORT as unknown as number,
    database : process.env.SQL_DB,
    user     : process.env.SQL_USR,
    password : process.env.SQL_PWD,
    timezone : moment.utc().utcOffset(moment().tz("America/Halifax").utcOffset()).format("Z"),
  });

  try {
    const queryName:string = req.body.query;
    const query = sqlQuery[queryName as keyof typeof sqlQuery];
    const para = req.body.para;
    const [data] = await db.execute(query, para);
    db.end();
    
    res.status(200).json({ data: data });
  } catch (error:any) {
    res.status(500).json({ error: error.message });
  }
}