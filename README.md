# scriptAPI_common_functions

scriptAPIでのレッスン作成の際の共通関数
subtreeとして利用

## pull
cd your-world-project
git remote add common https://github.com/yourname/minecraft-common.git
git subtree add --prefix=behavior_packs/worldNameBp/utils common main --squash
git subtree add --prefix=behavior_packs/worldNameBp/configs common main --squash

