import axios from "axios";
import ShowVideo from "../components/ShowVideo";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box, Grid, GridItem, Image, Text } from '@chakra-ui/react';
import Footer from "../components/Footer";

export default function Gallery({ userId }) {
   const [mediaList, setMediaList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [gifList, setGifList] = useState([]);
  const [groups, setGroups] = useState([]);


  useEffect(() => {
    const token = Cookies.get('token');
    const header = { 'Authorization': `Bearer ${token}` };

    //GETTING USER GROUPS
      
    //  axios.get(process.env.REACT_APP_BASE_URL + 'user', { headers: header })
    axios.get(process.env.REACT_APP_BASE_URL + 'user', { headers: header })
            .then(function (response) {
                return response.data
            }).then(function (data) {
                setGroups(data.groups)

                axios.get(process.env.REACT_APP_BASE_URL + "video/", { headers: header })
                // axios.get("http://n11684763-imagevideo-service-alb-943714070.ap-southeast-2.elb.amazonaws.com/api/video", { headers: header })
                .then((response) => {
                  console.log(response.data);
                  setMediaList(response.data.videos); // Assuming the API returns a "videos" array
                })
                .catch((error) => {
                  console.error('Error fetching videos:', error);

            }).catch(function (err) {
                console.log(err)
            })
      });
  }, []);

  useEffect(() => {
    const videos = mediaList.filter(media => media.filename.endsWith(".mp4"));
    const gifs = mediaList.filter(media => media.filename.endsWith(".gif"));

    setVideoList(videos);
    setGifList(gifs);
  }, [mediaList]);

   return (
    <>
      <Box>
        <Box
          bgGradient="linear(to-b, #7E30E1, #E26EE5)"
          height="fit-content"
          //display="flex"
          //justifyContent="center"
          //alignItems="center"
          minHeight="100vh" 
          //display="flex" 
          //flexDirection="colum"          
        >    
          <Navbar />
          <Box  m={20}>
            <div className="gallery-container">
              <Tabs variant='soft-rounded' colorScheme='purple'  >
                <TabList>
                  <Tab
                   fontSize="lg"  
                    p={4}           
                    color="white"   
                    bg="purple.500" 
                    _selected={{ color: "white", bg: "purple.700" }}                              
                  >
                    Videos
                  </Tab>
                  {groups.length > 0 && <Tab
                   fontSize="lg"  
                    p={4}           
                    color="white"   
                    bg="purple.500" 
                    _selected={{ color: "white", bg: "purple.700" }}                              
                  >GIFs
                  </Tab>} 
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <div className="video-gallery-container"> 
                    {videoList.length === 0 ? (
                      <p>No videos available.</p>
                    ) : (
                      videoList.map((video, index) => (
                        <ShowVideo key={index} videoSrc={video.url} title={video.filename} />
                      ))
                    )}
                    </div>
                  </TabPanel>

                  {groups.length > 0 && (
                    <TabPanel>
                      {gifList.length === 0 ? (
                        <p>No GIFs available.</p>
                      ) : (
                        <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
                          {gifList.map((gif, index) => (
                            <GridItem key={index}>
                              <Box border="1px solid #ccc" borderRadius="md" overflow="hidden">
                                <Image
                                  src={gif.url}
                                  alt={gif.filename}
                                  boxSize="200px" // Ensuring uniform size
                                  objectFit="cover"
                                />
                                <Text textAlign="center" mt={2}>{gif.filename}</Text>
                              </Box>
                            </GridItem>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </div>
          </Box>
        </Box>
        <Footer style={{ marginTop: 'auto' }} />
      </Box>
    </>
  );
}

//   return (
//     <>
//       <Navbar />
//       <div className="gallery-container">
//         {videoList.length === 0 ? (
//           <p>No videos available.</p>
//         ) : (
//           videoList.map((video, index) => (
//             <ShowVideo key={index} videoSrc={video.url} title={video.filename} />
//           ))
//         )}
//       </div>
//     </>
//   );
// }
