const express = require('express');
const node_fetch = require('node-fetch');
const fs = require('fs');
const body_parser = require('body-parser');
const cors = require('cors');
const csv_parse = require('csv-parse');
const randomstring = require("randomstring");

const server = express();


server.use(body_parser.json());
server.use(cors());

const PORT = process.env.PORT || 4000


server.post("/", async function(req, res) {
    //check if the right object is posted
    if (req.body.csv && req.body.csv.url) {
        let { select_fields, url } = req.body.csv;

        //fetching the csv_file
        let result = await node_fetch(url);
        //checking if its a valid csv file
        let split = result.headers.get("content-type").split('; ');
        if (split[0] === "text/csv") {
            //writing csv file
            let destination = fs.createWriteStream("./csv_file.csv");

            result.body.pipe(destination);

            destination.on("finish", function () {
                let content = fs.readFileSync('./csv_file.csv', 'utf-8');

                //parsing csv to an array

                csv_parse(content, function (err, arr) {
                    //the final array
                    let json_fields_array = []

                    //arr would be an array of arrrays. the first be the one with the fields/columns while the others being the values
                    for (let i = 1; i < arr.length; i++) {
                        //declaring the singlular json files 
                        let json_fields = {}

                        //if select_sides is given 
                        if (select_fields) {
                            for (let x = 0; x < select_fields.length; x++) {
                                json_fields[select_fields[x]] = arr[i][arr[0].indexOf(select_fields[x])]

                                if (x === select_fields.length - 1) {
                                    json_fields_array.push(json_fields);
                                }
                            }
                        } else {
                            for (let column of arr[0]) {
                                json_fields[column] = arr[i][arr[0].indexOf(column)];

                                if (arr[0].indexOf(column) === arr[0].length - 1) {
                                    json_fields_array.push(json_fields);
                                }
                            }
                        }
                    }

                    //using randomstring to create an identifier
                    let identifier = randomstring.generate();

                    res.status(200).json({
                        conversion_key: identifier,
                        json: json_fields_array
                    });
                });
            });
        } else {
            res.status(401).json({ err: "not a csv file" });
            return
        }
    } else {
        res.status(401).json({ err: "make sure you have sent an object with a csv property having a url property" });
        return
    }
});

server.listen(PORT, function() {
    console.log("actve at port " + PORT);
});