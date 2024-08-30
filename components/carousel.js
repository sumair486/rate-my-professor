'use client';
import React, { useEffect, useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ProfessorCarousel() {
  const [professors, setProfessors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await fetch('/api/professors?text=some_query');
        if (!response.ok) {
          throw new Error('');
        }
        const data = await response.json();
        setProfessors(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProfessors();
  }, []);

  return (
    <div>
      {error && <Typography color="error">{error}</Typography>}
      <Carousel
        indicators={false}
        navButtonsProps={{          
          style: {
            backgroundColor: '#7077A1',
            color: 'white',
          },
        }}
        navButtonsWrapperProps={{
          style: {
            top: '50%',
            transform: 'translateY(-50%)',
            margin: '0 10px', // Adjust the distance from the card
          }
        }}
        NextIcon={<ArrowForwardIosIcon/>}
        PrevIcon={<ArrowBackIosIcon />}
      >
        {professors.map((professor, index) => (
          <Card
            key={index}
            sx={{
              maxWidth: 600,
              margin: 'auto',
              backgroundColor: '#7077A1',
              color: 'White',
              padding: 4,
              borderRadius: 4,
            }}
          >
            <CardContent>
              <Typography variant="h4" component="div">
                {professor.name}
              </Typography>
              <Typography variant="body1">
                <strong>School:</strong> {professor.school}
              </Typography>
              <Typography variant="body1">
                <strong>Department:</strong> {professor.department}
              </Typography>
              <Typography variant="body1">
                <strong>Rating:</strong> {professor.rating}
              </Typography>
              <Typography variant="body1">
                <strong>Review:</strong> {professor.review}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Carousel>
    </div>
  );
}

export default ProfessorCarousel;
