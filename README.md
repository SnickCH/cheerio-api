[README.md](https://github.com/user-attachments/files/22708689/README.md)
# Cheerio API – REST Interface

This project provides a simple REST API built with Node.js, Express, and Cheerio. It can be used to parse HTML content via HTTP requests. The API exposes a basic test endpoint for health checks and a main endpoint for HTML parsing.

## Disclaimer
- Project created on 2025-10-05. I only did a few tests
- This will be used in my own N8N workflows
- No support "as-is" and on your own risk


## Features

- Built on Node.js and Express
- Uses Cheerio for server-side HTML parsing.
- Supports both CSS selector-based parsing and custom script execution via secure vm2 sandbox
- Provides a REST interface for easy integration with automation tools such as n8n
- Docker-ready for isolated deployments

  
## public image
- if you dont want to build your own local image, you can use the following one
Be Aware that I will not update the existing images. This is for my own usage - you are welcome to use it too.

### Tages
```
snickch/cheerio-api:1.1.2        - Cheerio 1.1.2, with Express 5.1.0 (FROM Node20-alpine), vm2 "latest" ->only a quick test
snickch/cheerio-api:latest       - Cheerio "latest", with Express "latest" (FROM Node20-alpine), vm2 "latest" ->in work in my environment

```
1.1.2 - will not be renwed
latest - The latest tag does not update automatically – it is only used when a new version is required by the workflow. It mainly ensures that the container works correctly and avoids issues caused by missing tags.

### Architecture
- ARM64 ->tested
- AMD64 ->not tested

## Security
- There is no security for any endpoint. It is designed to be used in your own environment only (for example: in the same network as N8N)
- The image will not be updated. They work for me and I don't want anything to change.
- New images with new versions may be created. If you wish to have a new version, feel free to open an issue (speficy exactly which version of Cheerio and Express you want to have, and why: Issues with the existing images or some new features that you want to use?)
- Minimum security for scripts: Custom scripts run in a sandbox environment (vm2). The main purpose is to mitigate script errors, not to protect against security breaches — keep that in mind.

## Endpoints

### 1. Test Endpoint `/hello`

A simple GET endpoint to verify that the container and the API are running.

**Request:**
```
GET /hello
```

**Example (Browser):**
```
http://localhost:4444/hello
```

**Response:**
```
Hallo von der Cheerio API!
```

---

### 2. Parsing Endpoint `/parse` - Selector based

Parses provided HTML using a CSS selector.  
You send raw HTML and a selector in the body, and the API responds with the extracted data.

**Request:**

```
POST /parse
Content-Type: application/json

{
  "html": "<html><body><h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p></body></html>",
  "selector": "p"
}
```

**Response:**
```json
{
  "selector": "p",
  "count": 2,
  "results": ["Paragraph 1", "Paragraph 2"]
}
```

### 3. Parsing Endpoint `/parse` - custom script execution

Parses provided HTML using a CSS selector.  
You send raw HTML and a selector in the body, and the API responds with the extracted data.

**Request:**

```
POST /parse
Content-Type: application/json

{
  "html": "<html><body><div class='product'><span class='price'>CHF 19.90</span></div></body></html>",
  "script": "$('div.product').map((i, el) => ({ price: $(el).find('.price').text() })).get()"
}

```

**Response:**
```json
{
    "result": [
        {
            "price": "CHF 19.90"
        }
    ]
}
```



---

## Running with Docker

### Local build
Build and run the container:

```bash
docker build -t cheerio-api .
docker run --rm -p 4444:3000 cheerio-api
```

### Premaid images
Please check the section "public images"

### DockerCompose example (with premaid image)
```
version: '3.8'

services:
  cheerio-api:
    image: snickch/cheerio-api:1.1.2 
    container_name: cheerio-api
    ports:
      - "4444:3000" # External IPs can access the container - not needed for N8N etc (directly on port 3000 in the same network)
    restart: unless-stopped
```

The API will be available at `http://localhost:4444`.

---

## Usage Examples

### A) Testing the API with `/hello`

Open the following URL in your browser:

```
http://localhost:4444/hello
```

This confirms the container is running and responding.

---

### B) Using `curl` to Test `/parse`


Selector
```bash
curl -X POST http://localhost:4444/parse \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Hello</h1><p>First</p><p>Second</p></body></html>",
    "selector": "p"
  }'
```

Expected response:
```json
{
  "selector": "p",
  "count": 2,
  "results": ["First", "Second"]
}
```

Custom script
```bash
curl -X POST http://localhost:3000/parse \
  -H "Content-Type: application/json" \
  -d '{"html":"<html><body><div class=\"product\"><span class=\"price\">CHF 19.90</span></div></body></html>","script":"$(\"div.product\").map((i, el) => ({price: $(el).find(\".price\").text()})).get()"}'

```
Expected response:
```json
{
    "result": [
        {
            "price": "CHF 19.90"
        }
    ]
}
```
---




### C) Example for an n8n HTTP Request Node

Configure the n8n HTTP Request Node as follows:

- **HTTP Method:** POST  
- **URL:** `http://cheerio-api:3000/parse` (if n8n runs in the same Docker network)  
  or `http://localhost:4444/parse` (if running locally and port is exposed)  
- **Response Format:** JSON  
- **Content Type:** JSON  

**Body Parameters:**
```json
{
  "html": "<html><body><h1>Title</h1><p>Content</p></body></html>",
  "selector": "p"
}
```

The node will return:
```json
{
  "selector": "p",
  "count": 1,
  "results": ["Content"]
}
```

You can then use `{{$json["results"]}}` in subsequent nodes.

---

## License

This project is provided as-is under your preferred license.
