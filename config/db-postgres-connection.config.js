require('dotenv').config();
const {Pool} = require("pg");
const pool=new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_password,
    port: process.env.db_port,
    ssl: {
        rejectUnauthorized: false,
      },
  });

const db={};
db.fetchRecords=async(query)=>{
    console.log("select query",query);
    const client = await pool.connect();
    try
    {    
        const response=await client.query(query);
        // console.log("Query result::",response.rows);
        client.release();
        return {status:true,msg:response.rows};
    }
    catch(error)
    {
        client.release();
        console.log("Problem in fetching records",error);
        return {status:false,error:["error"+error],response:{}};
    }
};
db.updateRecords=async(data,tablename,condition="",isSQL=false)=>{
    const client=await pool.connect();
    try
    {
        const columnName=Object.keys(data);
        let columnValue=Object.values(data);

        if(columnName.length!=columnValue.length)
            return {status:false,error:"Column and its values are not matched."};

        
        for(let i=0;i<columnValue.length;i++)
        {
            if(typeof(columnValue[i])=="string" && columnValue[i].indexOf(columnName[i])>-1)
            {
                columnValue[i]=columnName[i]+"="+columnValue[i];
            }
            else if(typeof(columnValue[i])=="string")
                columnValue[i]=columnName[i]+"="+client.escapeLiteral(columnValue[i]);
            else
                columnValue[i]=columnName[i]+"="+columnValue[i];
        }

        if(condition!="")
            condition="and "+condition;
        
        columnValue=columnValue.join(",");

        const query="Update "+tablename+" set "+columnValue+" where 1=1 "+condition+";";

        console.log("update query",query);

        if(isSQL)
        {
            client.release();
            return {status:true,msg:"Query fetched successfully",response:query};
        }

        const response=await client.query(query);

        client.release();

        return {status:true,msg:"Record updated successfully."};
    }
    catch (error)
    {
        console.log("Exception in updating record",error);
        return {status:false,error:["error"+error],response:{}};
    }
};
db.deleteRecords=async(tablename,condition="",isSQL=false)=>{
    const client=await pool.connect();
    try
    {
        if(condition!="")
            condition="and "+condition;

        const query="delete from "+tablename+" where 1=1 "+condition+";";

        if(isSQL)
        {
            client.release();
            return {status:true,msg:"Query fetched successfully",response:query};
        }

        console.log("Delete query::",query);
        const response=await client.query(query);

        client.release();

        return {status:true,msg:"Record deleted successfully."};
    }
    catch (error)
    {
        console.log("Exception in deleting record",error);
        return {status:false,error:["error"+error],response:{}};
    }
};
db.insertRecords=async(data,tablename,isSQL=false)=>{
    const client=await pool.connect();
    try 
    {
        // console.log("data",data);
        let columnName=Object.keys(data);
        let columnValue=Object.values(data);

        if(columnName.length!=columnValue.length)
            return {status:false,error:"Column and its values are not matched."};

        // console.log("column name length before loop",columnName.length);
        // console.log("column value length before loop",columnValue.length);
        
        for(let i=0;i<columnValue.length;i++)
        {

            // columnName[i]=client.escapeIdentifier(columnName[i]);

            if(typeof(columnValue[i])=="string" && columnValue[i].indexOf("nextval")==-1 && columnValue[i].indexOf("pgp_sym_encrypt")==-1)
                columnValue[i]=client.escapeLiteral(columnValue[i]);
        }

        columnValue=columnValue.join(",");
        columnName=columnName.join(",");

        const query="insert into "+tablename+"("+columnName+") values("+columnValue+");";

        if(isSQL)
        {
            client.release();
            return {status:true,msg:"Query fetched successfully",response:query};
        }
            

        console.log("Insert query",query);

        const response=await client.query(query);

        console.log("Insert response",response);

        client.release();

        return {status:true,msg:"Record inserted successfully."};
    }
    catch (error)
    {
        client.release();
        console.log("Exception in insert record",error);
        return {status:false,error:["error"+error],response:{}};
    }
}
db.procedure=async(data,procedureName)=>
{
    const client=await pool.connect();
    try 
    {
        //console.log(data);
        
        const query="call "+procedureName+"("+data.join(",")+");";

        console.log("Procedure query:::",query);

        const response=await client.query(query);

        client.release();

        return {
                status:true,msg:"Procedure executed successfully."//,response
            };
    }
    catch (error)
    {
        client.release();
        console.log("Exception in insert record",error);
        return {status:false,error:["error"+error],response:{}};
    }
}
module.exports={
    fetchRecords:db.fetchRecords,
    insertRecords:db.insertRecords,
    deleteRecords:db.deleteRecords,
    updateRecords:db.updateRecords,
    procedureCall:db.procedure
};