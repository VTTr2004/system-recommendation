import torch, os
import pandas as pd

BASE_PATH = os.getcwd().replace("\\", '/')

class HydricRecommend:
    def recommend(self, user, kind='NFM', k = 5):
        if kind == 'NFM':
            embedding = torch.load(BASE_PATH + '/server_python/recommender/nfm_rec_data.pt')
        elif kind == 'LGN':
            embedding = torch.load(BASE_PATH + '/server_python/recommender//lgc_rec_data.pt')

        user_id = embedding['user_id_map'].get(user, '')
        df = pd.read_csv(f"{BASE_PATH}/server_python/database/user_place.csv")
        # get item user not travel
        item_traveled = df[df['user_id'] == user_id]['place_id'].unique()
        item_ids = [item_id for item_id in embedding['item_id_map'].values() if item_id not in item_traveled]

        item_emb = embedding['item_emb'][item_ids]
        user_emb = embedding['user_emb'][user_id]
        scores = torch.matmul(item_emb, user_emb)
        topk_idx = torch.topk(scores, k).indices

        inv_item_map = {v: k for k, v in embedding['item_id_map'].items()}
        recommendations = [inv_item_map[i.item()] for i in topk_idx]

        return recommendations