import express from "express";
import awsIott from "aws-iot-device-sdk";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import {
  DynamoDBDocumentClient,
  DynamoDBDocument,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
("use strict");
var dist = [];
async function fetchDistricts() {
  const response = await fetch(
    "https://raw.githubusercontent.com/hmpandey/All-Indian-States-With-Districts-JSON-List/master/list.json"
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  data.states.map((ele) => {
    dist = dist.concat(ele["districts"]);
  });
  dist.sort();
}
fetchDistricts();
app.post("/get-dist", async (req, res) => {
  var to_send = [];
  dist.map((names) => {
    names.toLowerCase().includes(req.body.dis_name.toLowerCase())
      ? to_send.push(names)
      : null;
  });
  res.send(to_send);
});
app.post("/get-cities", async (req, res) => {
  (async () => {
    const where = encodeURIComponent(
      JSON.stringify({
        ascii_name: {
          $regex: req.body.name,
          $options: "i",
        },
      })
    );
    const response = await fetch(
      `https://parseapi.back4app.com/classes/Indiacities_india_cities_database?order=ascii_name&keys=&where=${where}`,
      {
        headers: {
          "X-Parse-Application-Id": process.env.PARSE_APP_ID,// This is your app's application id
          "X-Parse-REST-API-Key": process.env.PARSE_REST_API_KEY // This is your app's REST API key
        },
      }
    );
    const data = await response.json(); // Here you have the data that you need
    res.send(JSON.stringify(data, null, 2));
  })();
});
const my_AWSAccessKeyId = process.env.AWSACCESSKEYID;
const my_AWSSecretKey = process.env.AWSSECRETKEYID;
const aws_region = process.env.AWS_REGION;
const empTable1 = process.env.EMP_TABLE_1
const empTable2 = process.env.EMP_TABLE_2
const empTable3 = process.env.EMP_TABLE_3

var dynamoDB = DynamoDBDocument.from(
  new DynamoDB({
    region: aws_region,
    credentials: {
      accessKeyId: my_AWSAccessKeyId,
      secretAccessKey: my_AWSSecretKey,
    },
  })
);
async function fetchDatafromDatabase2(ele) {
  // get method fetch data from dynamodb
  var id = ele;
  var params = {
    TableName: empTable1,
    Key: {
      uniqueId: id,
    },
  };
  const rsp = await DynamoDBDocumentClient.from(dynamoDB).send(
    new GetCommand(params)
  );
  return [rsp["Item"]];
}
var result = [];
async function fetchDatafromDatabase3(ele) {
  // get method fetch data from dynamodb
  var id = ele;
  var params = {
    TableName: empTable2,
    Key: {
      username: id,
    },
  };
  const rsp = await DynamoDBDocumentClient.from(dynamoDB).send(
    new GetCommand(params)
  );
  return [rsp["Item"]];
}
app.post("/login", async (req, res) => {
  var result = [];
  if (req.body.flag == "admin" && req.body.userinput && req.body.userinput.username) {
    result = await fetchDatafromDatabase3(req.body.userinput.username);
    if (result[0] && result[0].admin_flag == "Admin1") {
      if (result[0].password == req.body.userinput.password) {
        if (req.body.flag == "admin" && result[0].admin_flag == "Admin1") {
          res.send("success");
        }
      }
      else{
      res.send("Invalid Password");
    }
    }
    else{
      res.send("Invalid Username");
    }
  } else if(req.body.flag == "client" && req.body.clientinput && req.body.clientinput.username) {
    result = await fetchDatafromDatabase3(req.body.clientinput.username);
    if (result[0] && !result[0].admin_flag) {
      if (result[0].password == req.body.clientinput.password) {
        if (req.body.flag == "client" && !result[0].admin_flag) {
          res.send({ Name: result[0].name });
        }
      }
      else{
      res.send("Invalid Password");
    }
    }
    else{
      res.send("Invalid Username");
    }
  }
  else{
    res.send("Invalid Authentication");
  }
});
const port = process.env.PORT || 3000;
app.post("/add-data", async (req, res) => {
  var dynamoDB = DynamoDBDocument.from(
    new DynamoDB({
      region: aws_region,
      credentials: {
        accessKeyId: my_AWSAccessKeyId,
        secretAccessKey: my_AWSSecretKey,
      },
    })
  );
  const command = new PutCommand( {
    TableName: empTable3,
    Item: {
      uniqueId:req.body.macAddress,
      client_select:req.body.client,
      "device-name":req.body.device_name
    },
  });

  const response = await dynamoDB.send(command);
  res.send("Done")
});
app.post("/get-name", async (req, res) => {
  var params = {
    TableName: empTable2,
  };
  if(! req.body.client_name){
    params.Key={}
    params.Key.username=req.body.username
  const rsp = await DynamoDBDocumentClient.from(dynamoDB).send(
    new GetCommand(params)
  );
  if(rsp["Item"]){
  if (
    rsp["Item"]["password"] == req.body.password &&
    rsp["Item"]["admin_flag"]!="Admin1"
  ) {
    res.send({...rsp["Item"],...{flag:"client"}});
  } else if(rsp["Item"]["password"] == req.body.password && rsp["Item"]["admin_flag"]=="Admin1") {
    res.send({ flag: "admin" });
  }
  else{
    res.send("Invalidd")
  }
}
else{
  res.send("Invalid")
}
  }
  else{
    dynamoDB.scan(params, (err, data) => {
      // console.log(data)
    for (var item in data["Items"]){
      // console.log(rsp["Items"][item].name)
      if(data["Items"][item].name==req.body.client_name){
        // console.log("Yes")
        res.send("Invalid name")
        return;
      }
    }
    // console.log("Yessss")
    res.send("Ok name")
  })
}
});
app.post("/add2",async(req,res)=>{
  // console.log(req.body);
  const command = new PutCommand( {
    TableName: empTable2,
    Item: {
      username:req.body.username,
      password:req.body.password,
      name:req.body.login=="Client"?req.body.name:"",
      "admin_flag":req.body.login=="Admin"?"Admin1":"",
      district:req.body.login=="Client"?req.body.district:"",
      city:req.body.login=="Client"?req.body.city:"",
      location:req.body.login=="Client"?req.body.location:"",
    },
  });

  const response = await dynamoDB.send(command);
  res.send("Done");
})
app.get("/client-select", async function (req, res) {
  var params = {
    TableName: empTable2,
  };
  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      var ans = [];
      data.Items.forEach((item) => {
        if(! item["admin_flag"]){
        ans.push(item["name"]);
        }
      });
      ans = new Set(ans);
      res.send(Array.from(ans).sort());
    }
  });
});
app.post("/devicecheck", function (req, res) {
  var params = {
    TableName: empTable3,
  };
  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      var ans = [];
      ans=data.Items.filter((item) => {
        return (req.body.id && item["uniqueId"] == req.body.id) || (req.body.device_name && item["device-name"]==req.body.device_name);
      });
      if (ans.length != 0) {
        if(req.body.device_name){
          res.send(ans[0]["uniqueId"]==req.body.id?"Device with this mac_address already exists":"Device with this device_name already exists");
        }
        else{
          res.send(ans[0]);
        }
      } else {
        res.send("Ok");
      }
    }
  });
});
app.post("/device-select", async function (req, res) {
  let ans = [];
  let new_ans = [];

  try {
    // First scan
    var params = {
      TableName: empTable2,
    };

    const data1 = await new Promise((resolve, reject) => {
      dynamoDB.scan(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    data1.Items.forEach((item) => {
      if (
        (!req.body.cs || (req.body.cs && req.body.cs == item["name"])) &&
        (!req.body.ds || (req.body.ds && req.body.ds == item["district"])) &&
        (!req.body.cis || (req.body.cis && req.body.cis == item["city"])) &&
        (!req.body.ls || (req.body.ls && req.body.ls == item["location"]))
      ) {
        // console.log(item, "hi");
        ans.push(item);
      }
    });

    // console.log(ans, 123, req.body);

    // Second scan
    params = {
      TableName: empTable3,
    };

    const data2 = await new Promise((resolve, reject) => {
      dynamoDB.scan(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    data2.Items.forEach((item) => {
      ans.forEach((ansItem) => {
        if (
          item["client_select"] == ansItem["name"] &&
          (!req.body.dname ||
            (req.body.dname && req.body.dname == item["uniqueId"])) &&
          (!req.body.refname ||
            (req.body.refname && req.body.refname == item["device-name"]))
        ) {
          // console.log("Yes", item);
          new_ans.push(Object.assign({}, item, ansItem));
          // console.log("Yes2", new_ans);
        }
      });
    });
    new_ans.sort((a,b)=>{new Intl.Collator().compare(a["device-name"], b["device-name"])})
    // console.log(new_ans);
    res.send(new_ans);

  } catch (err) {
    console.error("Error scanning the table. Error JSON:", JSON.stringify(err, null, 2));
    if (err.code) {
      console.error(`Error Code: ${err.code}`);
    }
    if (err.message) {
      console.error(`Error Message: ${err.message}`);
    }
    res.status(500).send("Error processing request");
  }
});
app.post("/find", async function (req, res) {
  var result = [];
  if (req.body.id_view) {
    result = await fetchDatafromDatabase2(req.body.id_view);
  }
  var r = [];
  for (var i in result) {
    r.push(result[i]);
  }
  res.send(r);
});

app.get("/district-select", function (req, res) {
  var params = {
    TableName: empTable2,
  };
  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      var ans = [];
      data.Items.forEach((item) => {
        if(! item["admin_flag"]){
          ans.push(item["district"]);
          }
      });
      ans = new Set(ans);
      res.send(Array.from(ans).sort());
    }
  });
});
app.get("/city-select", function (req, res) {
  var params = {
    TableName: empTable2,
  };
  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      var ans = [];
      data.Items.forEach((item) => {
        if(! item["admin_flag"]){
          ans.push(item["city"]);
          }
      });
      ans = new Set(ans);
      res.send(Array.from(ans).sort());
    }
  });
});
app.get("/location-select", function (req, res) {
  var params = {
    TableName: empTable2,
  };
  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      var ans = [];
      data.Items.forEach((item) => {
        if(! item["admin_flag"]){
          ans.push(item["location"]);
          }
      });
      ans = new Set(ans);
      res.send(Array.from(ans).sort());
    }
  });
});
function callit(st,id) {
  var device = awsIott.device({
    keyPath:
      process.env.IOT_KEY_PATH,
    certPath:
      process.env.IOT_CERT_PATH,
    caPath: process.env.IOT_CA_PATH,
    clientId: process.env.IOT_CLIENT_ID,
    host:process.env.IOT_HOST ,
  });


  device.on("connect", function () {
    device.publish("curtain1/sub", JSON.stringify({ status: st , uniqueId:id,enum:"status"}));
  });

  device.on("message", function (topic, payload) {
    console.log("message", topic, payload.toString());
  });

  device.on("close", function () {
    device.end();
  });
}

app.post("/change", async (req, res) => {
  await callit(req.body.st,req.body.id);
  var params = {
    TableName: empTable1,
    Key: {
      uniqueId: req.body.id,
    },
  };
  const rsp = await DynamoDBDocumentClient.from(dynamoDB).send(
    new GetCommand(params)
  );
  if(! rsp || !rsp["Item"]){
    res.send("Not done")
  }
  else{
  const command = new PutCommand( {
    TableName: empTable1,
    Item: {
      uniqueId:rsp["Item"].uniqueId,
      Indoor_Temp:rsp["Item"].Indoor_Temp,
      Power:rsp["Item"].Power,
      DST:rsp["Item"].DST,
      Outdoor_Temp:rsp["Item"].Outdoor_Temp,
      Status:req.body.st==1?0:1,
      current_dt:rsp["Item"].current_dt
    },
  });
  const response = await dynamoDB.send(command);
  res.send("Done")
}
});

app.post("/checki",async(req,res)=>{
  var id = req.body.id;
  var params = {
    TableName: empTable1,
    Key: {
      uniqueId: id,
    },
  };
  const rsp = await DynamoDBDocumentClient.from(dynamoDB).send(
    new GetCommand(params)
  ).catch(err => console.error(err));
  if(! rsp || !rsp["Item"]){
    res.send(["OFF",0])
  }
  else{
  // Get the current timestamp in milliseconds
  const currentTimestampMs = Date.now();
  // console.log(currentTimestampMs,rsp["DST"],rsp)
  if(currentTimestampMs-rsp["Item"]["current_dt"]<6000){
    res.send(["ON",rsp["Item"]["Status"]])
  }
  else{
    res.send(["OFF",rsp["Item"]["Status"]])
  }
}
})

app.post("/delete-client",async(req,res)=>{
  const command = new DeleteCommand( {
    TableName: empTable2,
    Key: {
      username:req.body.username,
    },
  });

  const response = await dynamoDB.send(command);
  res.send("ok")
})
app.post("/delete-device",async(req,res)=>{
  const params={
    TableName:empTable3,
  }
  var ans=[];
  await dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      ans=data.Items.filter((item) => {
        return(item["uniqueId"]==req.body.id);
      });
      if(ans[0]){
        // console.log(ans[0])
      const command = new DeleteCommand( {
        TableName: empTable3,
        Key: {
          uniqueId:req.body.id,
        },
      });
      const response = dynamoDB.send(command);
      res.send("ok")
    }
    }
  });
})
// Function to describe a Thing and check its connectivity status
app.listen(port, () => {
  console.log("listening on port");
});
