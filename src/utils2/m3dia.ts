import fs from 'node:fs'
import path from 'node:path'
import FormData from 'form-data'

// var axios = require('axios');

// var qs = require('qs');
import qs from 'qs'

// var fs = require('fs');
import mime from 'mime-types'
import axios from '@axios'

// var mime = require('mime-types');
// var path = require('path');

// const readChunkSync = require('read-chunk');
// import {readChunk, readChunkSync} from '../../read-chunk/index'

class M3dia {
  constructor(public clientOpts: any, public opts: any, public apiVersion: any, public baseURL: any, public token: any, public files: any, public endpoints: any, public chunkPhase: any, public chunks: any, public chunkActive: any, public chunkStartOffset: any, public chunkMaxActive: any, public chunkMaxRetries: any, public fileSize: any, public chunkFile: any, public chunkSize: any, public chunkSessionId: any) {
    this.clientOpts = opts || {}
    this.apiVersion = this.clientOpts.version || 'v1'
    this.baseURL = `${this.clientOpts.server}/${this.apiVersion}`
    this.token = this.clientOpts.token || null
    this.files = null
    this.endpoints = this.clientOpts.endpoints || {
      upload: 'files/upload',
      chunk: 'files/upload/chunk',
      auth: 'auth',
      youtubeDownload: 'youtubes/download',
      facebookDownload: 'facebooks/download',
    }
    this.chunkPhase = 'start'
    this.chunks = []
    this.chunkActive = []
    this.chunkStartOffset = 0
    this.chunkMaxActive = this.clientOpts.maxActiveChunk || 3
    this.chunkMaxRetries = 1
    this.fileSize = 0
    this.chunkFile = null
    this.chunkSize = null
    this.chunkSessionId = null
  }

  async getToken(this: any) {
    const self = this
    try {
      const assignUrl = `${self.baseURL}/${self.endpoints.auth}`

      const data = {
        username: self.clientOpts.user.username,
        password: self.clientOpts.user.password,
      }

      const response = await self._postx(assignUrl, data)
      if (response.data && response.data.access_token)
        self.token = response.data.access_token

      return self.token
    }
    catch (error) {
      return error
    }
  }

  async getFileStatus(this: any, fileId: any) {
    const self = this
    try {
      const uri = `${self.baseURL}/files/${fileId}?fields=status`
      const response = await self._get(uri)

      return response.data
    }
    catch (error) {
      return error
    }
  }

  async upload(this: any, form: any) {
    const self = this
    try {
      const uploadUrl = `${self.baseURL}/${self.endpoints.upload}`
      const response = await self._post(uploadUrl, form)
      if (response.data)
        self.files = response.data

      return self.files
    }
    catch (error) {
      return error
    }
  }

  /*
      async chunkUpload(file, isConvert) {
          var self = this;
          try {
              if (!isConvert) isConvert = "true";
              if (fs.existsSync(file)) {
                  self.chunkFile = file;
                  var start = await self._start(isConvert);
                  console.log("Start:", start);
                  if (start.status == 'success') {
                      console.log("Uploading...");
                      // await self._singleThreadUpload();
                      await self._multiThreadUpload();
                  }
              }
              return self.files;
          } catch (error) {
              return error;
          }
      }, */

  /* A function that is being called by the following code: */
  //   async chunkUpload(this: any, file: any, opts: any) {
  //       var self = this;
  //       try {
  //           var uploadOpts = {
  //               isConvert: "true",
  //               isTranscode: "false"
  //           };
  //           //update cho các version trước khi nhận tham số string
  //           if(typeof opts == 'string') {
  //               uploadOpts = {
  //                   isConvert: opts,
  //                   isTranscode: "false"
  //               }
  //           } else if(typeof opts == 'object') {
  //               if(opts.isConvert) uploadOpts.isConvert = opts.isConvert.toString();
  //               if(opts.isTranscode) uploadOpts.isTranscode = opts.isTranscode.toString();
  //           }

  //           if (fs.existsSync(file)) {
  //               self.chunkFile = file;
  //               var start = await self._start(uploadOpts);
  //               console.log("Start:", start);
  //               if (start.status == 'success') {
  //                   console.log("Uploading...");
  //                   await self._multiThreadUpload();
  //               }
  //           }
  //           return self.files;
  //       } catch (error) {
  //           return error;
  //       }
  //   }

  getUri(this: any, endpoint: any) {
    const self = this
    try {
      if (endpoint)
        return `${self.baseURL}/${self.endpoints[endpoint]}`
      const data = {}
      for (const i in self.endpoints)
        (data as any)[i] = `${self.baseURL}/${self.endpoints[i]}`

      return data
    }
    catch (error) {
      return error
    }
  }

  async deleteFile(this: any, fileId: any) {
    const self = this
    try {
      if (fileId) {
        const urlDelete = `${self.baseURL}/files/${fileId}`
        const del = await self._delete(urlDelete)
        if (del.data)
          return del.data

        return false
      }
    }
    catch (error) {
      return error
    }
  }

  async youtubeDownload(this: any, id: string) {
    const self = this
    try {
      const downloadUrl = `${self.baseURL}/${self.endpoints.youtubeDownload}`

      const data = {
        id,
      }

      const response = await self._postx(downloadUrl, data)
      if (response.response && response.response.status
                  && response.response.status != 200) {
        return {
          error: {
            code: response.response.status,
            message: response.response.data.message,
          },
        }
      }
      if (response.data)
        self.files = response.data

      return self.files
    }
    catch (error) {
      return error
    }
  }

  async facebookDownload(this: any, url: string) {
    const self = this
    try {
      const downloadUrl = `${self.baseURL}/${self.endpoints.facebookDownload}`

      const data = {
        id: url,
      }

      const response = await self._postx(downloadUrl, data)
      if (response.response && response.response.status
                  && response.response.status != 200) {
        return {
          error: {
            code: response.response.status,
            message: response.response.data.message,
          },
        }
      }
      if (response.data)
        self.files = response.data

      return self.files
    }
    catch (error) {
      return error
    }
  }

  _sleep(ms: any) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  _load() {

  }

  /**
       * Start phase
       * Sends a request to the backend to initialise the chunks
       */
  async _start(this: any, opts: any) {
    const self = this
    try {
      self.chunkPhase = 'start'

      const stats = fs.statSync(self.chunkFile)
      const mimetype = mime.lookup(self.chunkFile)
      const name = path.basename(self.chunkFile)
      const startForm = new FormData()

      startForm.append('phase', self.chunkPhase)
      startForm.append('mime_type', mimetype)
      startForm.append('name', name)
      startForm.append('size', stats.size)
      startForm.append('is_convert', opts.isConvert)
      startForm.append('is_transcode', opts.isTranscode)
      self.fileSize = stats.size

      const uploadUrl = `${self.baseURL}/${self.endpoints.chunk}`
      const response = await self._post(uploadUrl, startForm)
      if (typeof response.data != 'undefined') {
        self.chunkSessionId = response.data.data.session_id
        self.chunkSize = response.data.data.end_offset

        return response.data
      }

      return { status: false }
    }
    catch (error) {
      return error
    }
  }

  async _finish(this: any) {
    const self = this
    try {
      const uploadUrl = `${self.baseURL}/${self.endpoints.chunk}`

      self.chunkPhase = 'finish'

      const finishForm = new FormData()

      finishForm.append('phase', self.chunkPhase)
      finishForm.append('session_id', self.chunkSessionId)

      const response = await self._post(uploadUrl, finishForm)
      if (response.data)
        self.files = [response.data]

      return self.files
    }
    catch (error) {
      return error
    }
  }

  // async _createChunk(this: any) {
  //     var self = this;
  //     try {
  //         let startPosition = 0;
  //         while (startPosition < self.fileSize) {
  //             let blob = readChunkSync(self.chunkFile, {startPosition, length: self.chunkSize});
  //             let chunkItem = {
  //                 blob: blob,
  //                 startOffset: startPosition,
  //                 active: false,
  //                 retries: self.chunkMaxRetries
  //             }
  //             self.chunks.push(chunkItem);
  //             startPosition = startPosition + self.chunkSize;
  //         }
  //     } catch (error:any) {
  //         console.log(error.message);
  //         return error;
  //     }
  // }

  async _singleThreadUpload(this: any) {
    const self = this
    try {
      const uploadUrl = `${self.baseURL}/${self.endpoints.chunk}`

      self.chunkPhase = 'upload'
      await self._createChunk()
      for (const item in self.chunks) {
        const chunkForm = new FormData()

        chunkForm.append('phase', self.chunkPhase)
        chunkForm.append('session_id', self.chunkSessionId)
        chunkForm.append('start_offset', self.chunks[item].startOffset)
        chunkForm.append('chunk', self.chunks[item].blob)

        const upload = await self._post(uploadUrl, chunkForm)

        console.log('Uploading part:', item, upload.data)
      }
      await self._finish()

      return self.files
    }
    catch (error) {
      return error
    }
  }

  async _multiThreadUpload(this: any) {
    const self = this
    try {
      self.chunkPhase = 'upload'
      await self._createChunk()
      while (self.chunks.length > 0) {
        const activeChunks = self.chunks.splice(0, self.chunkMaxActive)
        const responses = await self._multiPost(activeChunks)
        for (const item in responses)
          console.log(responses[item].data)
      }
      await self._finish()

      return self.files
    }
    catch (error) {
      return error
    }
  }

  async _multiPost(this: any, chunks: any) {
    const self = this
    try {
      const jobs: any = []
      const uploadUrl = `${self.baseURL}/${self.endpoints.chunk}`
      for (const i in chunks) {
        const chunkForm = new FormData()

        chunkForm.append('phase', self.chunkPhase)
        chunkForm.append('session_id', self.chunkSessionId)
        chunkForm.append('start_offset', chunks[i].startOffset)
        chunkForm.append('chunk', chunks[i].blob)

        const req = axios({
          method: 'POST',
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 3600000,
          url: uploadUrl,
          headers: {
            Authorization: `Bearer ${self.token}`,
            ...chunkForm.getHeaders(),
          },
          data: chunkForm,
        })

        jobs.push(req)
      }

      return await axios.all(jobs)
    }
    catch (error) {
      console.log(error)

      return error
    }
  }

  async _postx(this: any, uri: any, data: any) {
    const self = this
    try {
      const config = {
        method: 'POST',
        url: uri,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${self.token}`,
        },
        data: qs.stringify(data),
      }

      return await axios(config)
    }
    catch (error) {
      return error
    }
  }

  async _post(this: any, uri: any, form: any) {
    const self = this
    try {
      const config = {
        method: 'POST',
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 3600000,
        url: uri,
        headers: {
          'Authorization': `Bearer ${self.token}`,
          'Content-Type': 'multipart/form-data',
        },
        data: form,
      }

      return await axios(config)
    }
    catch (error: any) {
      console.log(error.message)

      return error
    }
  }

  async _delete(this: any, uri: any) {
    const self = this
    try {
      const config = {
        method: 'DELETE',
        url: uri,
        headers: {
          Authorization: `Bearer ${self.token}`,
        },
      }

      return await axios(config)
    }
    catch (error) {
      return error
    }
  }

  async _get(this: any, uri: any) {
    const self = this
    try {
      const config = {
        method: 'GET',
        url: uri,
        headers: {
          Authorization: `Bearer ${self.token}`,
        },
      }

      return await axios(config)
    }
    catch (error) {
      return error
    }
  }
}

export default M3dia
