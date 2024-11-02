import React, { useState } from 'react';
import { Input, Button, Box, SimpleGrid, Image, Spinner, Text } from '@chakra-ui/react';
import axios from 'axios';

export default function ImageSearch({ selectedImages, setSelectedImages }) {
  const [query, setQuery] = useState(''); // Search query state
  const [images, setImages] = useState([]); // State to store images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Error state

  // Function to handle search submission
  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);

    try {
      // const apiURL = `${process.env.REACT_APP_BASE_URL}video/pixabay`;
      const apiURL = ` http://n11684763-imagevideo-service-alb-943714070.ap-southeast-2.elb.amazonaws.com/api/video/pixabay`;
      const params = { q: query };
      const url = `${apiURL}?${new URLSearchParams(params).toString()}`;
      const response = await axios.get(url);
      setImages(response.data); // Images filtered to only webformatURL from pixabay
    } catch (err) {
      setError('Error fetching images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image selection/deselection
  const handleImageSelect = (image) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter((img) => img !== image)); // Deselect image
      console.log(selectedImages)
    } else {
      setSelectedImages([...selectedImages, image]); // Select image
    }
  };

  return (
    <Box width="40%" alignItems="center" justifyContent="center" mx="auto"
    >
      <Box
        bg="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={4}
        m={4}
        pt={6}
        pr={4}
        pb={6}
        pl={4}
        borderRadius="lg"
        width="100%"

      >
        <Input
          placeholder="Search for images..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="md"
          width="70%"
          mr={2}
          bg="whitesmoke"
        />
        <Button colorScheme="purple" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Box textAlign="center" mb={4}>
          <Text color="red.500">{error}</Text>
        </Box>
      )}

      {/* Loading Spinner */}
      {loading && (
        <Box textAlign="center" my={4}>
          <Spinner size="xl" color="purple.500" />
        </Box>
      )}

      {/* Display Images */}
      {!loading && images.length > 0 && (
        <Box bgGradient="transparent"
          minHeight="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={3}
          width="100%"
        >
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {images.map((image) => (
              <Box
                key={image.id}
                boxShadow="md"
                p={2}
                rounded="md"
                bg={selectedImages.includes(image) ? "purple.100" : "white"} // Highlight selected images
                cursor="pointer"
                onClick={() => handleImageSelect(image)} // Handle image click
              >
                <Image src={image.webformatURL} alt={image.tags} rounded="md" />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );

}
