from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import os
os.system('cls')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc ["http://localhost:5000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_PATH = os.getcwd().replace("\\", '/') + '/server_python/database'

# ===== 1. Summary =====
@app.get("/summary")
async def get_summary():
    with open(f"{BASE_PATH}/summary.txt", 'r', encoding='utf-8') as file:
        data = file.read()
    return {
        "content": data
    }


def read_csv(file_name):
    df = pd.read_csv(os.path.join(BASE_PATH, file_name), encoding="utf-8-sig")
    df.columns = df.columns.str.strip()
    return df


# ===== Models =====
class LoginRequest(BaseModel):
    username: str

class UserResponse(BaseModel):
    id: str
    username: str
    fullName: str
    avatarUrl: str | None = None

class SearchRequest(BaseModel):
    query: str

def find_user_by_token(token):
    df = read_csv("user.csv")
    user = df[df['user_name'] == token]
    if user.empty:
        raise HTTPException(status_code=401, detail="Invalid username")
    row = user.iloc[0]
    return {
            "user_name": row["user_name"],
            "user_id": str(row["user_id"]),
            "full_name": row["full_name"],
            "avatar_url": row.get("avatar_url")
        }
    

# ===== Auth =====
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401)
    
    token = authorization.split(" ")[1]  # "Bearer <token>"
    # ví dụ tìm user theo token
    user = find_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401)
    return user

# ===== Endpoints =====
@app.post("/login")
async def login(data: LoginRequest):
    df = read_csv("user.csv")
    user = df[df['user_name'] == data.username]
    if user.empty:
        raise HTTPException(status_code=401, detail="Invalid username")
    row = user.iloc[0]
    return {'user':
                {
            "user_name": row["user_name"],
            "user_id": str(row["user_id"]),
            "full_name": row["full_name"],
            "avatar_url": row.get("avatar_url")
            },
            'token': row["user_name"]
        }

@app.get("/user/profile")
async def get_profile(user = Depends(get_current_user)):
    return user

import math

def clean_value(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return ""
    return val
@app.get("/user/visited-places")
async def get_visited_places(user = Depends(get_current_user)):
    user_place_df = read_csv("user_place.csv")
    place_df = read_csv("place.csv")
    visited_place_ids = user_place_df[user_place_df["user_id"]==int(user["user_id"])]["place_id"].tolist()
    visited_places = place_df[place_df["place_id"].isin(visited_place_ids)]

    result = []
    for _, row in visited_places.iterrows():
        result.append({
            "place_id": str(row["place_id"]),
            "place_name": clean_value(row["place_name"]),
            "address": clean_value(row["address"]),
            "thumb_url": clean_value(row["thumb_url"]),
            "description": clean_value(row["description"]),
            "content": clean_value(row["content"])
        })
    return result

@app.get("/places")
async def get_places():
    place_df = read_csv("place.csv")
    result = []
    for _, row in place_df.iterrows():
        result.append({
            "place_id": str(row["place_id"]),
            "place_name": clean_value(row["place_name"]),
            "address": clean_value(row["address"]),
            "thumb_url": clean_value(row["thumb_url"]),
            "description": clean_value(row["description"]),
            "content": clean_value(row["content"])
        })
    return result

@app.post("/places/search")
async def search_places(req: SearchRequest):
    place_df = read_csv("place.csv")
    q = req.query.lower()
    filtered = place_df[
        place_df["place_name"].str.lower().str.contains(q) |
        place_df["address"].str.lower().str.contains(q)
    ]
    result = []
    for _, row in filtered.iterrows():
        result.append({
            "place_id": str(row["place_id"]),
            "place_name": clean_value(row["place_name"]),
            "address": clean_value(row["address"]),
            "thumb_url": clean_value(row["thumb_url"]),
            "description": clean_value(row["description"]),
            "content": clean_value(row["content"])
        })
    return result

@app.get("/places/{place_id}/info")
async def get_place_info(place_id: str):
    place_df = read_csv("place.csv")
    place = place_df[place_df["place_id"].astype(str) == place_id]
    if place.empty:
        raise HTTPException(status_code=404, detail="Place not found")
    row = place.iloc[0]
    data = {
        "place_id": str(row["place_id"]),
        "place_name": clean_value(row["place_name"]),
        "address": clean_value(row["address"]),
        "thumb_url": clean_value(row["thumb_url"]),
        "description": clean_value(row["description"]),
        "content": clean_value(row["content"])
    }
    return data
    
@app.get("/places/{place_id}/content")
async def get_place_content(place_id: int):
    place_df = read_csv("place.csv")
    place_df["place_id"] = place_df["place_id"].astype(int)
    place = place_df[place_df["place_id"] == place_id]
    if place.empty:
        raise HTTPException(status_code=404, detail="Place not found")
    data = {"content": clean_value(place["content"].iloc[0])}
    return data

@app.get("/places/{place_id}/comments")
async def get_place_comments(place_id: str):
    # id,username,place_id,content,date
    comment_df = read_csv("comment.csv")
    comment_df = comment_df[comment_df["place_id"].astype(str) == place_id]
    result = []
    for _, row in comment_df.iterrows():
        result.append({
            "id": f"c{row['id']}",
            "username": clean_value(row["username"]),
            "place_id": clean_value(row["place_id"]),
            "content": clean_value(row["content"]),
            "date": str(row["date"])
        })
    return result

from .recommender.recommender import Recommend
recommender = Recommend()

@app.post("/ai/recommend")
async def get_ai_recommendations(user = Depends(get_current_user)):
    # Trả mock hoặc logic AI nếu muốn
    place_rec = recommender.recommend(user['user_name'], 'NFM', 5)
    place_df = read_csv("place.csv")
    result = []
    for _, row in place_df[place_df['place_name'].isin(place_rec)].iterrows():
        result.append({
            "place_id": str(row["place_id"]),
            "place_name": clean_value(row["place_name"]),
            "address": clean_value(row["address"]),
            "thumb_url": clean_value(row["thumb_url"]),
            "description": clean_value(row["description"]),
            "content": clean_value(row["content"])
        })
    return result