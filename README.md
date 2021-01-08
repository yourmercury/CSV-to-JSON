# CSV-to-JSON
A Node js server with a single post endpoint for converting CSV files to JSON format

## Usage
  using the fetch in browser javascript api, make a post request with the body having the object below
  
  {
    csv: {
            url: "link to the file",
            select_fields: [an array of the columns you want back] //optional, if you dont provide this property, all columns would be returned
         }
  }
