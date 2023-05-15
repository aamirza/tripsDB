const express = require('express');
const cors = require('cors');

const TripDB = require("./modules/tripsDB.js");
require('dotenv').config();

const { MONGODB_CONN_STRING } = process.env;
const PORT = process.env.PORT || 8080;
const STATUS_CODE = {
    "CREATED": 201,
    "NO_CONTENT": 204,
    "BAD_REQUEST": 400,
    "NOT_FOUND": 404,
    "SERVER_ERROR": 500,
}

const app = express();
app.use(cors());
app.use(express.json());

const db = new TripDB();


app.get("/", (req, res) => {
    res.send({message: "API Listening"});
});

app.get("/api/trips", (req, res, next) => {
    const page = req.query.page;
    const perPage = req.query.perPage;
    db.getAllTrips(page, perPage).then((trips) => {
        res.send(trips);
    }).catch((err) => {
        next(err);
    });
});

app.post("/api/trips", (req, res, next) => {
    db.addNewTrip(req.body.data).then(newTrip => {
            res.status(STATUS_CODE["CREATED"]).send(newTrip);
        }
    ).catch(err => {
        next(err);
    });
});

app.get("/api/trips/:id", (req, res, next) => {
    const tripId = req.params.id;
    db.getTripById(tripId).then(trip => {
        if (trip) {
            res.send(trip);
        } else {
            res.status(STATUS_CODE["BAD_REQUEST"]).send({message: "Trip not found"});
        }
    }).catch(err => {
        res.status(STATUS_CODE["BAD_REQUEST"]).send({message: err.message});
    });
});

app.put("/api/trips/:id", (req, res, next) => {
   const tripId = req.params.id;
   const data = req.body.data;
   db.updateTripById(data, tripId).then(trip => {
       if (trip) {
           res.send(trip);
       } else {
           res.status(STATUS_CODE["NOT_FOUND"]).send({message: "Trip not found"});
       }
   }).catch(err => {
         next(err);
   });
});

app.delete("/api/trips/:id", (req, res, next) => {
    const tripId = req.params.id;
    db.deleteTripById(tripId).then(() => {
        res.status(STATUS_CODE["NO_CONTENT"]).send();
    }).catch(err => {
        next(err);
    });
});

app.use((err, req, res, next) => {
    res.status(STATUS_CODE["SERVER_ERROR"]).send({message: err.message});
});

db.initialize(MONGODB_CONN_STRING).then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});


