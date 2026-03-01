import express from "express";
import awsIott from "aws-iot-device-sdk";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
const __dirname = path.resolve();


import {
  DynamoDBDocumentClient,
  DynamoDBDocument,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDB,DynamoDBClient,GetItemCommand } from "@aws-sdk/client-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
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
const empTable4 = process.env.EMP_TABLE_4
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT; 
const DYNAMO_TABLE = process.env.DYNAMO_TABLE; //table for status connections

const dbClient = new DynamoDBClient({
  region: aws_region,
  credentials: {
    accessKeyId: my_AWSAccessKeyId,
    secretAccessKey: my_AWSSecretKey
  }
});
const apiClient = new ApiGatewayManagementApiClient({
  region: aws_region,
  endpoint: WEBSOCKET_ENDPOINT,
  credentials: {
    accessKeyId: my_AWSAccessKeyId,
    secretAccessKey: my_AWSSecretKey
  }
});

app.post('/relayChange', async (req, res) => {
  const { id, st } = req.body;

  if (!id || typeof st !== 'number' || ![0, 1].includes(st)) {
    return res.status(400).send('Invalid request body');
  }

  try {
    // 1. Fetch connectionId from DynamoDB
    const data = await dbClient.send(new GetItemCommand({
      TableName: DYNAMO_TABLE,
      Key: { uniqueId: { S: id } }
    }));

    if (!data.Item) {
      return res.status(404).send('Device not connected');
    }

    const connectionId = data.Item.connectionId.S;
    const message = { relayStatus: st };

    console.log(`Sending relayStatus=${st} to device ${id} via connectionId=${connectionId}`);

    // 2. Try to send the message over WebSocket
    try {
      await apiClient.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(message))
      }));
      res.status(200).send('Relay status sent successfully');
    } catch (err) {
      if (err.name === 'GoneException') {
        console.warn('Connection stale. Deleting connection from DB...');

        // 3. Clean up the stale connection
        await dbClient.send(new DeleteItemCommand({
          TableName: DYNAMO_TABLE,
          Key: { uniqueId: { S: id } }
        }));

        return res.status(410).send('Device disconnected');
      } else {
        console.error('Failed to send WebSocket message:', err);
        throw err;
      }
    }

  } catch (err) {
    console.error('Error handling /relayChange:', err);
    res.status(500).send('Failed to send relay status');
  }
});

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
async function fetchDatafromDatabase4(ele) {
  // ele should be an object containing { uniqueId, current_dt }
  var params = {
    TableName: empTable4,
    Key: {
      uniqueId: ele.uniqueId,
      current_dt: ele.current_dt,
    },
  };
  const rsp = await DynamoDBDocumentClient.from(dynamoDB).send(
    new GetCommand(params)
  );
  return [rsp["Item"]];
}
async function fetchAllDataByUniqueId(ele) {
  let items = [];
  let lastKey = undefined;

  do {
    const params = {
      TableName: empTable4,
      KeyConditionExpression: "uniqueId = :uid",
      ExpressionAttributeValues: {
        ":uid": ele.uniqueId
      },
      ExclusiveStartKey: lastKey
    };

    const rsp = await DynamoDBDocumentClient
      .from(dynamoDB)
      .send(new QueryCommand(params));

    if (rsp.Items) {
      items.push(...rsp.Items);
    }

    lastKey = rsp.LastEvaluatedKey;

  } while (lastKey);

  return items;
}
async function fetchDataByUniqueIdAndDateRange(ele) {
  let items = [];
  let lastKey = undefined;

  do {
    const params = {
      TableName: empTable4,
      KeyConditionExpression:
        "uniqueId = :uid AND current_dt BETWEEN :startDt AND :endDt",
      ExpressionAttributeValues: {
        ":uid": ele.uniqueId,
        ":startDt": Number(ele.startDate),
        ":endDt": Number(ele.endDate)
      },
      ExclusiveStartKey: lastKey
    };

    const rsp = await DynamoDBDocumentClient
      .from(dynamoDB)
      .send(new QueryCommand(params));

    if (rsp.Items) {
      items.push(...rsp.Items);
    }

    lastKey = rsp.LastEvaluatedKey;

  } while (lastKey);

  return items;
}

app.get("/items/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    let data;
    if (startDate && endDate) {
      data = await fetchDataByUniqueIdAndDateRange({ uniqueId, startDate, endDate });
    } else {
      data = await fetchAllDataByUniqueId({ uniqueId });
    }
    return res.json({ count: data.length, items: data });
  } catch (err) {
    console.error("DynamoDB query error:", err);
    return res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  var result = [];
  if (req.body.flag == "admin" && req.body.userinput && req.body.userinput.username) {
    result = await fetchDatafromDatabase3(req.body.userinput.username);
    if (result[0] && result[0].admin_flag == "1") {
      if (result[0].password == req.body.userinput.password) {
        if (req.body.flag == "admin" && result[0].admin_flag == "1") {
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
    if (result[0] && result[0].admin_flag=="0") {
      if (result[0].password == req.body.clientinput.password) {
        if (req.body.flag == "client" && result[0].admin_flag=="0") {
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
app.post(
  "/add-data-iot/:macAddress/:client/:device_name/:wifi_name/:wifi_pass",
  async (req, res) => {
    const dynamoDB = DynamoDBDocument.from(
      new DynamoDB({
        region: aws_region,
        credentials: {
          accessKeyId: my_AWSAccessKeyId,
          secretAccessKey: my_AWSSecretKey,
        },
      })
    );

    const { macAddress, client, device_name, wifi_name, wifi_pass } = req.params;

    const command = new PutCommand({
      TableName: empTable3,
      Item: {
        uniqueId: macAddress,
        client_select: client,
        "device-name": device_name,
        "wifi_name": wifi_name,
        "wifi_password": wifi_pass,
        timestamp: new Date().toISOString(),
      },
    });

    try {
      const response = await dynamoDB.send(command);
      res.status(200).send("Data added successfully");
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).send("Error inserting data");
    }
  }
);
app.post("/user-role", async (req, res) => {
  const username = req.body.name;

  const params = {
    TableName: empTable2,
  };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error("Scan error:", err);
      return res.status(500).send("Error checking user role");
    }

    const user = data.Items.find(item => item.username === username);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const role = user.admin_flag === "0" ? "client" : "admin";
    res.send({ username, role });
  });
});
app.post("/check-power", async (req, res) => {
  const { id, power } = req.body;

  if (!id || power === undefined) {
    return res.status(400).send("Missing id or power value");
  }

  const failedMessage = power > 1000 ? "device failed due to exceeding power limit" : "";

  const updateParams = {
    TableName: empTable1,
    Key: {
      uniqueId: id,
    },
    UpdateExpression: "SET Failed_Device = :fd",
    ExpressionAttributeValues: {
      ":fd": failedMessage,
    },
  };

  try {
    await DynamoDBDocumentClient.from(dynamoDB).send(new UpdateCommand(updateParams));
    res.send("Device power check and failure status updated");
  } catch (error) {
    console.error("Error in power check:", error);
    res.status(500).send("Internal Server Error");
  }
});
import { v4 as uuidv4 } from "uuid";

// app.post("/add-data", async (req, res) => {
//   const dynamoDBClient = new DynamoDBClient({
//     region: aws_region,
//     credentials: {
//       accessKeyId: my_AWSAccessKeyId,
//       secretAccessKey: my_AWSSecretKey,
//     },
//   });

//   const dynamoDB = DynamoDBDocument.from(dynamoDBClient);

//   try {
//     // Step 1: Scan the table for all device_id values
//     const scanCommand = new ScanCommand({
//       TableName: empTable3,
//       ProjectionExpression: "device_id",
//     });

//     const scanResult = await dynamoDBClient.send(scanCommand);

//     let maxId = 0;
//     if (scanResult.Items) {
//       for (const item of scanResult.Items) {
//         const id = parseInt(item.device_id);
//         if (!isNaN(id) && id > maxId) {
//           maxId = id;
//         }
//       }
//     }

//     const newDeviceId = maxId + 1;

//     // Step 2: Prepare the item
//     const uniqueId = req.body.macAddress?.trim() || uuidv4();

//     const item = {
//       uniqueId,
//       device_id: newDeviceId,
//       client_select: req.body.client,
//       "device-name": req.body.device_name,
//       wifi_name: req.body.wifi_name,
//       wifi_password: req.body.wifi_pass,
//       timestamp: new Date().toISOString(),
//     };

//     // Step 3: Save new item
//     const putCommand = new PutCommand({
//       TableName: empTable3,
//       Item: item,
//     });

//     await dynamoDB.send(putCommand);
//     res.send("Done");
//   } catch (error) {
//     console.error("DynamoDB Error:", error);
//     res.status(500).send("Error adding data");
//   }
// });


// app.post("/add-data", async (req, res) => {
//   const dynamoDBClient = new DynamoDBClient({
//     region: aws_region,
//     credentials: {
//       accessKeyId: my_AWSAccessKeyId,
//       secretAccessKey: my_AWSSecretKey,
//     },
//   });

//   const dynamoDB = DynamoDBDocument.from(dynamoDBClient);

//   try {
//     // Step 1: Scan table for all device_id values
//     const scanCommand = new ScanCommand({
//       TableName: empTable3,
//       ProjectionExpression: "device_id",
//     });

//     const scanResult = await dynamoDB.send(scanCommand);

//     // Step 2: Find the maximum device_id
//     let maxId = 0;
//     if (scanResult.Items) {
//       for (const item of scanResult.Items) {
//         const id = item.device_id;
//         if (typeof id === "number" && id > maxId) {
//           maxId = id;
//         }
//       }
//     }

//     const newDeviceId = maxId + 1;

//     // Step 3: Set uniqueId
//     const uniqueId = req.body.macAddress?.trim() || uuidv4();

//     // Step 4: Construct the item
//     const item = {
//       uniqueId,
//       device_id: newDeviceId,
//       client_select: req.body.client,
//       "device-name": req.body.device_name,
//       wifi_name: req.body.wifi_name,
//       wifi_password: req.body.wifi_pass,
//       timestamp: new Date().toISOString(),
//     };

//     // Step 5: Insert into DynamoDB
//     const putCommand = new PutCommand({
//       TableName: empTable3,
//       Item: item,
//     });

//     await dynamoDB.send(putCommand);

//     res.send("Done");
//   } catch (error) {
//     console.error("DynamoDB Error:", error);
//     res.status(500).send("Error adding data");
//   }
// });

app.post("/add-data", async (req, res) => {
  const {
    macAddress,
    client,
    device_name,
    district,
    city,
    location,
    sector,
    state,
    pincode
  } = req.body;

  // Validate only required fields
  if (!macAddress || !device_name || !client) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Build the item with required and optional fields
    const item = {
      uniqueId: macAddress,
      client_select: client,
      "device-name": device_name,
    };

    if (district) item.district = district;
    if (city) item.city = city;
    if (location) item.location = location;
    if (sector) item.sector = sector;
    if (state) item.state = state;
    if (pincode) item.pin = pincode;

    // Put to empTable3
    const commandEmpTable3 = new PutCommand({
      TableName: empTable3,
      Item: item,
    });

    // Put to empTable1
    const commandEmpTable1 = new PutCommand({
      TableName: empTable1,
      Item: {
        uniqueId: macAddress,
        Status: 0,
        timestamp: new Date().toISOString(),
      },
    });

    await dynamoDB.send(commandEmpTable3);
    await dynamoDB.send(commandEmpTable1);

    res.status(200).send("Device added to both tables successfully");
  } catch (error) {
    console.error("Error adding device:", error);
    res.status(500).send("Failed to add device");
  }
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
    rsp["Item"]["admin_flag"]!="1"
  ) {
    res.send({...rsp["Item"],...{flag:"client"}});
  } else if(rsp["Item"]["password"] == req.body.password && rsp["Item"]["admin_flag"]=="1") {
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

app.post("/add2", async (req, res) => {
  const { username, password, login, name } = req.body;

  if (!username || !password || !login) {
    return res.status(400).send("Missing required fields");
  }

  const isClient = login === "Client";

  const command = new PutCommand({
    TableName: empTable2,
    Item: {
      username,
      password,
      login, // Storing "Client" or "Admin"
      admin_flag: login === "0" ? "1" : "0", // optional: depends how you use this
      name: isClient ? name || "" : "",
    },
  });

  try {
    await dynamoDB.send(command);
    res.status(200).send("Done");
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).send("Failed to add user");
  }
});

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
        if(item["admin_flag"]=="0"){
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

app.post("/check-emergency", async (req, res) => {
  const deviceId = req.body.id;

  // STEP 1: Fetch current item
  const getParams = {
    TableName: empTable1,
    Key: {
      uniqueId: deviceId,
    },
  };

  try {
    const rsp = await DynamoDBDocumentClient.from(dynamoDB).send(
      new GetCommand(getParams)
    );

    if (!rsp || !rsp.Item) {
      return res.status(404).send("Device not found.");
    }

    // STEP 2: Check if emergency
    if (rsp.Item.DST == 1) {
      res.send({ emergency: true });
    } else {
      res.send({ emergency: false });
    }
  } catch (err) {
    console.error("Error checking emergency.", err);
    res.status(500).send("Internal server error.");
  }
});


app.post("/device-select", async function (req, res) {
  const {
    cs,      // client_select
    ds,      // district
    cis,     // city
    ls,      // location
    dname,   // device-name
    refname  // uniqueId
  } = req.body;

  const params = {
    TableName: empTable3,
  };

  try {
    const data = await new Promise((resolve, reject) => {
      dynamoDB.scan(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    const filtered = data.Items.filter(item => {
      return (
        (!cs || item.client_select === cs) &&
        (!ds || item.district === ds) &&
        (!cis || item.city === cis) &&
        (!ls || item.location === ls) &&
        (!dname || item.uniqueId=== dname) &&
        (!refname || item["device-name"] === refname)
      );
    });

    filtered.sort((a, b) => {
      return new Intl.Collator().compare(a["device-name"], b["device-name"]);
    });

    res.send(filtered);
  } catch (err) {
    console.error("Error in /device-select:", err);
    res.status(500).send("Error filtering device data.");
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

app.post("/district-select", function (req, res) {
  const { client_select } = req.body;

  const params = { TableName: empTable3 };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan:", err);
      res.status(500).send("Error");
    } else {
      const districts = new Set();

      data.Items.forEach(item => {
        if (
          item.district &&
          (!client_select || item.client_select === client_select)
        ) {
          districts.add(item.district);
        }
      });

      res.send(Array.from(districts).sort());
    }
  });
});


app.post("/city-select", function (req, res) {
  const { client_select } = req.body;

  const params = { TableName: empTable3 };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan:", err);
      res.status(500).send("Error");
    } else {
      const cities = new Set();

      data.Items.forEach(item => {
        if (
          item.city &&
          (!client_select || item.client_select === client_select)
        ) {
          cities.add(item.city);
        }
      });

      res.send(Array.from(cities).sort());
    }
  });
});


app.post("/location-select", function (req, res) {
  const { client_select } = req.body;

  const params = { TableName: empTable3 };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan:", err);
      res.status(500).send("Error");
    } else {
      const locations = new Set();

      data.Items.forEach(item => {
        if (
          item.location &&
          (!client_select || item.client_select === client_select)
        ) {
          locations.add(item.location);
        }
      });

      res.send(Array.from(locations).sort());
    }
  });
});
app.get("/state-select", function (req, res) {
  var params = {
    TableName: empTable2,
  };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).send("Error scanning the table.");
    } else {
      var ans = [];
      data.Items.forEach((item) => {
        if (item["admin_flag"] == "0" && item["state"]) {
          ans.push(item["state"]);
        }
      });

      ans = new Set(ans); // remove duplicates
      res.send(Array.from(ans).sort());
    }
  });
});
app.get("/sector-select", function (req, res) {
  var params = {
    TableName: empTable2,
  };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).send("Error scanning the table.");
    } else {
      var ans = [];
      data.Items.forEach((item) => {
        if (item["admin_flag"] == "0" && item["sector"]) {
          ans.push(item["sector"]);
        }
      });

      ans = new Set(ans); // remove duplicates
      res.send(Array.from(ans).sort());
    }
  });
});
app.get("/pincode-select", function (req, res) {
  var params = {
    TableName: empTable2,
  };

  dynamoDB.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).send("Error scanning the table.");
    } else {
      var ans = [];
      data.Items.forEach((item) => {
        if (item["admin_flag"] == "0" && item["pincode"]) {
          ans.push(item["pincode"]);
        }
      });

      ans = new Set(ans); // remove duplicates
      res.send(Array.from(ans).sort());
    }
  });
});
app.post("/change-password", async (req, res) => {
  const { username, newpass, confpass } = req.body;

  // 1. Validate inputs
  if (!username || !newpass || !confpass) {
    return res.status(400).send("Missing required fields");
  }

  // 2. Check if passwords match
  if (newpass !== confpass) {
    return res.status(400).send("Passwords do not match");
  }

  // 3. Perform password update (same logic for all users)
  const updateParams = {
    TableName: empTable2,
    Key: { username },
    UpdateExpression: "set #pwd = :newpass",
    ExpressionAttributeNames: {
      "#pwd": "password",
    },
    ExpressionAttributeValues: {
      ":newpass": newpass,
    },
  };

  dynamoDB.update(updateParams, (err, data) => {
    if (err) {
      console.error("Update error:", err);
      res.status(500).send("Error updating password");
    } else {
      res.send("Password updated successfully");
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
      current_dt:rsp["Item"].current_dt,
      RPM:rsp["Item"].RPM,
      Head_Count:rsp["Item"].Head_Count
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
  if(currentTimestampMs-rsp["Item"]["current_dt"]<10000){
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
app.post("/delete-device", async (req, res) => {
  const uniqueId = req.body.id;

  if (!uniqueId) {
    return res.status(400).send("Missing device ID");
  }

  try {
    // Optional: check if device exists in empTable3 before deleting
    const scanResult = await dynamoDB.send(new ScanCommand({
      TableName: empTable3,
      FilterExpression: "uniqueId = :uid",
      ExpressionAttributeValues: {
        ":uid": uniqueId,
      },
    }));

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return res.status(404).send("Device not found");
    }

    // Delete from empTable3
    const deleteFromEmpTable3 = new DeleteCommand({
      TableName: empTable3,
      Key: { uniqueId },
    });

    // Delete from empTable1
    const deleteFromEmpTable1 = new DeleteCommand({
      TableName: empTable1,
      Key: { uniqueId },
    });

    // Perform both deletions
    await Promise.all([
      dynamoDB.send(deleteFromEmpTable3),
      dynamoDB.send(deleteFromEmpTable1),
    ]);

    res.status(200).send("Device deleted from both tables successfully");
  } catch (error) {
    console.error("Error deleting device:", error);
    res.status(500).send("Failed to delete device");
  }
});


// Serve frontend (Vite build)
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
});


// Function to describe a Thing and check its connectivity status
app.listen(port, () => {
  console.log("listening on port");
});
