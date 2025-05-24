import axios from "axios"

async function fetching(url, options = {}) {
  try {
    const dataConfig = {
      ...options,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'max-age=0',
        'Cookie': 'MSGCC=granted; MicrosoftApplicationsTelemetryDeviceId=a5999b9a-96bd-4134-8617-27c09e6070c3;',
        'DNT': '1',
        'Priority': 'u=0, i',
        'Sec-Ch-Ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        ...options?.headers
      },
      url: url
    }
    const dataRequest = await axios.request(dataConfig)
    return {
      status: dataRequest.status,
      statusText: dataRequest.statusText,
      headers: dataRequest.headers,
      data: dataRequest.data
    }
  } catch(e) {
    const respondata = e.response
    if(respondata) {
      return {
        error: e.message,
        status: respondata.status,
        statusText: respondata.statusText,
        headers: respondata.headers,
        data: respondata.data
      }
    }
    return {
      error: e.message,
      status: -10,
      statusText: "Unknown",
      headers: {},
      data: undefined
    }
  }
}

export default fetching