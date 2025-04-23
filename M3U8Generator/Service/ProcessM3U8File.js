import dotenv from 'dotenv';
import { uploadToS3 } from '../utils/UploadToS3.js';
import ResolutionProcessing from '../Models/ResolutionSchema.js';
import VideoProcessing from '../Models/VideoProcessingSchema.js';
import MasterM3U8Processing from '../Models/MasterM3u8Processing.js';

dotenv.config();

export const processM3U8File= async({VideoID, resolution, S3Urls})=>{
    try{
        const hlsChunk=[];
        for(const i=0; i<S3Urls.size(); i++){
            hlsChunk.push(`#EXTINF:${chunkDuration},\n${chunkS3Url}`);
        }

        const hlsFileContent= [
            "#EXTM3U",
            "#EXT-X-VERSION:3",
            "#EXT-X-TARGETDURATION:20",
            "#EXT-X-MEDIA-SEQUENCE:0",
            ...hlsChunk,
            "#EXT-X-ENDLIST"
        ].join('\n');

        const hlsPlaylistFileName= `Video/Resoluted/${VideoID}_${resolution}.m3u8`;

        m3u8Content += '#EXT-X-ENDLIST';
      
        fs.writeFileSync(outputPath, m3u8Content, 'utf8');
        console.log(`✅ M3U8 file created at: ${outputPath}`);   
    
        const hlsOriginalFileS3URL= await uploadToS3(hlsPlaylistFileName, Buffer.from(hlsFileContent));
        console.log("M3U8 File had Been Uploaded to the S3");
        await ResolutionProcessing.findByIdAndUpdate(
            {VideoID: VideoID, resolution: resolution},
            {
                m3u8Generated: true,
                m3u8S3Url: hlsOriginalFileS3URL
            },
            {new: true}
        );

      
          await VideoProcessing.findOneAndUpdate(
            { videoID: VideoID },
            {
              $push: { resolutions: resolution },
              $set: { [`resolutionStatus.${resolution}`]: true,
              $push: {resolutionS3Urls: hlsOriginalFileS3URL}
             }
            },
            {
              new: true,     // return the updated document
              upsert: true   // create a new one if it doesn't exist
            }
          );
          
          const VideoProcessingStatus = await VideoProcessing.findOne({ videoID: VideoId });
          if (VideoProcessingStatus.resolutions.length === 3) {
                // Deffining the Code to Get all the S3Urls
                
          await VideoProcessing.findOneAndUpdate(
            { videoID: VideoID },
            {
              masterm3u8GenTriggered: true
            },
            {
              new: true,     // return the updated document
            }
          );
                const resolutionsS3Urls = VideoProcessingStatus.resolutionS3Urls;

                // Define bandwidths roughly (in bits/sec)
                const bandwidthMap = {
                    '360p': 800000,
                    '720p': 1600000,
                    '1080p': 3000000
                };

                // Define resolution dimensions
                const resolutionDimensions = {
                    '360p': '640x360',
                    '720p': '1280x720',
                    '1080p': '1920x1080'
                };

                // Build the master .m3u8 content
                let masterPlaylist = '#EXTM3U\n';

                for (const res of ['360p', '720p', '1080p']) {
                    const bandwidth = bandwidthMap[res];
                    const resolution = resolutionDimensions[res];
                    const url = resolutionsS3Urls[res]; // should be the .m3u8 URL for this resolution

                    masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${url}\n`;
                    }
                    console.log('Master Playlist:\n', masterPlaylist);
                    const hlsMaterFileName= `Video/Master/${VideoID}.m3u8`;

                    const MasterS3Url= uploadToS3(hlsMaterFileName,masterPlaylist);
                    await VideoProcessing.findOneAndUpdate(
                        { videoID: VideoID },
                        {
                          masterM3u8GeneratedAt: Date.now,
                        },
                        {
                          new: true,     // return the updated document
                        }
                      );


                      // Going to Create the Data inside teh 
                      await MasterM3U8Processing.create({
                        VideoID: VideoID,
                        masterM3U8S3Url: MasterS3Url,
                        generatedAt: Date.now,
                        status: 'generated',
                        resolutions: VideoProcessingStatus.resolutions,
                      });

                      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                      console.log("Master S3 Urls are Created");
                      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                      console.log(MasterS3Url);
            }
          
         }   
    catch(err){

    }
}