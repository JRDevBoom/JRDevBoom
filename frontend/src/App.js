import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CarData() {
  const [carData, setCarData] = useState([]);
  const [totalRemainingCars, setTotalRemainingCars] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/project_car');
      const { data1, total } = response.data;
      setCarData(data1);
      setTotalRemainingCars(total);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h1>Car Data</h1>
      <p>Total Remaining Cars: {totalRemainingCars}</p>
      <ul>
        {carData.map((item) => (
          <li key={item.time_interval}>
            {item.time_interval}: Car In - {item.carin}, Car Out - {item.carout}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CarData;