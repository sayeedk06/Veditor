import { Box, Text} from '@chakra-ui/react';
export default function ShowVideo({videoSrc, title}) {
    return (
        <Box
          className="video"
          width="320px"
          background="#F9F7F7"
          padding="20px"
          borderRadius="12px"
          boxShadow="lg"
          textAlign="center"
        >
          <Text fontSize="lg" color="#3F72AF" fontWeight="bold" mb="4">
            {title}
          </Text>
          {videoSrc ? (
            <video width="100%" height="auto" controls>
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Text fontSize="md" color="#112D4E">
              No Video created yet
            </Text>
          )}
        </Box>
      );
}