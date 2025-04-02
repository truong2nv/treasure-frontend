import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Snackbar,
  Alert,
  FormLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function TreasureHunt() {
  const theme = useTheme();
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [p, setP] = useState(1);
  const [fuel, setFuel] = useState();
  const [matrix, setMatrix] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const convertStringTo2DArray = (str) => {
    let parsedArray = JSON.parse(str);
    let resultArray = [];

    for (let i = 0; i < parsedArray.length; i++) {
      resultArray[i] = [...parsedArray[i]];
    }

    return resultArray;
  };

  useEffect(() => {
    // Function to call the API
    fetch("http://3.1.195.203:5000/api/treasure-hunt") //
      .then((response) => response.json())
      .then((data) => {
        const { p, n, m, matrixJson } = data;
        setP(p);
        setRows(n);
        setCols(m);
        setMatrix(convertStringTo2DArray(matrixJson));
        console.log(data);
      })
      .catch(() => {
        throw new Error("Lỗi!");
      });
  }, []);

  useEffect(() => {
    setMatrix(Array.from({ length: rows }, () => Array(cols).fill(1)));
  }, [rows, cols]);

  const handleChangeMatrix = (i, j, value) => {
    let newValue = Math.max(1, Math.min(Number(value), p)); // Giới hạn 1 → p
    let newMatrix = matrix.map((row, rowIndex) =>
      rowIndex === i
        ? row.map((cell, colIndex) => (colIndex === j ? newValue : cell))
        : row
    );
    setMatrix(newMatrix);
  };

  const solveTreasureHunt = async () => {
    const payload = { n: rows, m: cols, p, matrix };

    const response = await fetch("http://3.1.195.203:5000/api/treasure-hunt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data = await response.json();
      setFuel(data.fuel);
      if (data.fuel > -1) {
        setSnackbar({
          open: true,
          message: "Tìm kho báu thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Dữ liệu không hợp lệ!",
          severity: "error",
        });
      }
    }
  };

  const handleSave = async () => {
    const data = {
      n: rows,
      m: cols,
      p: p,
      matrix: matrix,
    };

    try {
      const response = await fetch(
        "http://3.1.195.203:5000/api/treasure-hunt/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Lưu dữ liệu thành công!",
          severity: "success",
        });
      } else {
        throw new Error("Lưu thất bại!");
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        padding: 5,
        boxShadow: 3,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: theme.palette.primary.main }}
      >
        Tìm Kho Báu
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={4}>
          <TextField
            label="Số hàng (n)"
            type="number"
            fullWidth
            value={rows}
            onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
            slotProps={{ input: { min: 1, max: 500 } }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Số cột (m)"
            type="number"
            fullWidth
            value={cols}
            onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
            slotProps={{ input: { min: 1, max: 500 } }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Số loại rương (p)"
            type="number"
            fullWidth
            value={p}
            onChange={(e) => setP(Math.max(1, Number(e.target.value)))}
            slotProps={{ input: { min: 1, max: rows * cols } }}
          />
        </Grid>
      </Grid>
      <Box sx={{ marginTop: 3, overflowX: "auto" }}>
        {matrix.map((row, i) => (
          <Grid
            container
            key={i}
            spacing={1}
            justifyContent="center"
            sx={{ marginBottom: 1 }}
          >
            {row.map((cell, j) => (
              <Grid item key={`${i}-${j}`}>
                <TextField
                  type="number"
                  value={cell}
                  onChange={(e) => {
                    let newValue = Math.max(
                      1,
                      Math.min(Number(e.target.value), p)
                    );
                    handleChangeMatrix(i, j, newValue);
                  }}
                  size="medium"
                  sx={{ width: 60, textAlign: "center" }}
                  slotProps={{ input: { min: 1, max: p } }} // Set min/max
                />
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>
      <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 3 }}>
        <Grid item>
          <Button variant="contained" color="secondary" onClick={handleSave}>
            Lưu dữ liệu
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={solveTreasureHunt}
          >
            Giải bài toán
          </Button>
        </Grid>
      </Grid>
      {fuel > -1 && (
        <Grid sx={{ marginTop: 3 }}>
          <FormLabel sx={{ color: "primary.main", fontSize: "18px" }}>
            Lượng nhiên liệu nhỏ nhất: {fuel}
          </FormLabel>
        </Grid>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
