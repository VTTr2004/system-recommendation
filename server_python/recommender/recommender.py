from .hydric import HydricRecommend

class Recommend:
    def recommend(self, user_name, query, kind='NFM', k =5):
        if kind == 'NFM' or kind == 'LGC':
            handler = HydricRecommend()
        return handler.recommend(user_name, kind, k)