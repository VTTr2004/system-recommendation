# backend/main.py
import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
os.system('cls')

# ====================
# CẤU HÌNH PATH DATABASE
# ====================
BASE_PATH = os.getcwd().replace("\\", '/') + '/database'

USER_CSV = f"{BASE_PATH}/user.csv"
PLACE_CSV = f"{BASE_PATH}/place.csv"
USER_PLACE_CSV = f"{BASE_PATH}/user_place.csv"
COMMENT_CSV = f"{BASE_PATH}/comment.csv"

# ====================
# FASTAPI APP
# ====================
app = FastAPI(title="Travel Recommendation API")

# Cho phép frontend truy cập từ localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================
# Pydantic Models
# ====================
class User(BaseModel):
    user_id: str
    user_name: str
    full_name: str
    avatar_url: Optional[str] = None
    role: Optional[str] = None

class Place(BaseModel):
    place_id: str
    place_name: str
    address: Optional[str] = None
    thumb_url: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

class Comment(BaseModel):
    id: str
    username: str
    place_id: str
    content: Optional[str] = None
    date: Optional[str] = None
    rating: Optional[int] = None

class RecommendationRequest(BaseModel):
    user_id: str
    query: Optional[str] = None

# ====================
# HELPER FUNCTIONS
# ====================
def load_csv(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Đọc CSV và ép tất cả cột sang string
    df = pd.read_csv(file_path, dtype=str)
    
    # Nếu muốn, có thể điền giá trị NaN thành chuỗi rỗng
    df = df.fillna('')
    
    return df

# ====================
# ENDPOINTS
# ====================

# Lấy danh sách tất cả người dùng
@app.get("/users", response_model=List[User])
def get_users():
    df = load_csv(USER_CSV)
    users = df.to_dict(orient="records")
    if users:
        users[0]['role'] = 'admin'  # chỉ dòng đầu tiên có role
    return users

# Lấy danh sách tất cả địa điểm
@app.get("/places", response_model=List[Place])
def get_places():
    df = load_csv(PLACE_CSV)
    return df.to_dict(orient="records")

# Lấy danh sách địa điểm đã ghé của một user
@app.get("/user_place", response_model=List[dict])
def get_user_places(user_id: str = Query(...)):
    df = load_csv(USER_PLACE_CSV)
    result = df[df["user_id"] == user_id]
    return result.to_dict(orient="records")

# Lấy tất cả bình luận
@app.get("/comments", response_model=List[Comment])
def get_comments(username: Optional[str] = None, place_id: Optional[str] = None):
    df = load_csv(COMMENT_CSV)
    if username:
        df = df[df["username"] == username]
    if place_id:
        df = df[df["place_id"] == place_id]
    return df.to_dict(orient="records")


# Tính rating trung bình cho từng địa điểm
@app.get("/ratings", response_model=dict)
def get_ratings():
    comments_df = load_csv(COMMENT_CSV)
    if comments_df.empty:
        return {}
    ratings = comments_df.groupby("place_id")["rating"].agg(["mean", "count"]).reset_index()
    ratings_dict = {}
    for _, row in ratings.iterrows():
        ratings_dict[row["place_id"]] = {
            "avg": f"{row['mean']:.1f}",
            "count": int(row["count"])
        }
    return ratings_dict

from recommender.recommender import Recommend
recommender = Recommend()

# Recommendation logic đơn giản: chưa đi thì gợi ý
@app.get("/recommendations", response_model=List[Place])
def get_recommendations(user_id: str = Query(...), query: Optional[str] = None):
    # 
    # user_place_df = load_csv(USER_PLACE_CSV)
    
    # visited_ids = user_place_df[user_place_df["user_id"] == user_id]["place_id"].tolist()

    visited_ids = recommender.recommend(user_id, query)
    places_df = load_csv(PLACE_CSV)
    recommendations = places_df[places_df["place_id"].isin(visited_ids)]

    # if query:
    #     recommendations = recommendations[recommendations["content"].str.contains(query, case=False, na=False)]
    return recommendations.to_dict(orient="records")