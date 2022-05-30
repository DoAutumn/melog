const App = {
    setup() {
        const moduleList = {
            list: {
                module_type: 'list',
                module_name: '文章列表',
                module_icon: 'list'
            },
            banner: {
                module_type: 'banner',
                module_name: '横幅图',
                module_icon: 'picture-fine'
            },
            navbar: {
                module_type: 'navbar',
                module_name: '导航块',
                module_icon: 'table'
            }
        };

        const data = reactive({
            specialItem: [],
            formData: {},
            itemID: -1,
            delBtnShow: false
        });

        onMounted(() => {
            getSpecialItemList();
            place.scrollOffset = document.getElementById('special-list').offsetTop;
        });

        const $ = (url, data) => {
            return new Promise((resolve, reject) => {
                const layer_id = layer.load(0);
                fetch(url, {
                    method: data ? 'post' : 'get',
                    body: data ? JSON.stringify(data) : null,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(rsp => {
                    layer.close(layer_id);
                    rsp.json().then(res => {
                        resolve(res);
                    });
                }).catch(e => {
                    layer.close(layer_id);
                });
            });
        }

        function getSpecialItemList() {
            $(url_special_item_list + "?special_id=" + special_id).then(res => {
                data.specialItem = res.data;
                data.itemID = -1;
                data.formData = {};
                data.delBtnShow = false;
                setTimeout(() => {
                    getElementTop();
                }, 1000);
            });
        }

        function specialItemClick(item) {
            // 为for循环加key
            if(item.type == 'swiper' && typeof item.key == 'undefined') {
                item.key = 0;
                item.data.forEach(it => {
                    item.key++;
                    it.key = item.key;
                });
            }
            if(item.type == 'navbar' && typeof item.key == 'undefined') {
                item.key = 0;
                item.data.list.forEach(it => {
                    item.key++;
                    it.key = item.key;
                });
            }

            data.itemID = item.id;
            data.formData = item;JSON.parse(JSON.stringify(item));
            data.delBtnShow = false;
        }

        function specialItemAdd(data) {
            $(url_special_item_add, data).then(res => {
                !res.state && layer.msg(res.msg, {time: 1800, icon: 2});
                res.state && layer.msg(res.msg, {time: 1800, icon: 1}, getSpecialItemList);
            });
        }

        function specialItemSave(data) {
            $(url_special_item_save, data).then(res => {
                !res.state && layer.msg(res.msg, {time: 1800, icon: 2});
                res.state && layer.msg(res.msg, {time: 1800, icon: 1}, () => {getSpecialItemList()});
            });
        }

        function specialItemDel() {
            const data = {
                id: data.itemID
            };
            $(url_special_item_del, data).then(res => {
                !res.state && layer.msg(res.msg, {time: 1800, icon: 2});
                res.state && layer.msg(res.msg, {time: 1800, icon: 1}, () => {getSpecialItemList()});
            });
        }

        function specialItemSort(sort_data) {
            const data = {
                special_id: special_id,
                sort: sort_data.join(',')
            };
            $(url_special_item_sort, data).then(res => {
                !res.state && layer.msg(res.msg, {time: 1800, icon: 2});
                res.state && layer.msg(res.msg, {time: 1800, icon: 1}, () => {getSpecialItemList()});
            });
        }

        function uploadDel(index) {
            if(data.formData.type == 'swiper') {
                data.formData.data.splice(index, 1);
            } else if(data.formData.type == 'navbar') {
                data.formData.data.list.splice(index, 1);
            }
        }

        function uploadAdd(index) {
            data.formData.key++;
            if(data.formData.type == 'swiper') {
                data.formData.data.splice(index + 1, 0, {key: data.formData.key});
            } else if(data.formData.type == 'navbar') {
                data.formData.data.list.splice(index + 1, 0, {key: data.formData.key});
            }
        }

        function rightClick(item) {console.log(data);
            if(data.itemID != item.id) {
                specialItemClick(item);
            }
            data.delBtnShow = true;
        }

        function buttonSave(formData) {
            console.log(formData);
            return;

            const data = $("form").serializeArray();
            if(!data.length) {
                return;
            }
            const form_data = {};
            form_data.id = data.formData.id;
            form_data.type = data.formData.type;
            data.forEach(field => {
                form_data[field.name] = field.value || '';
            });

            specialItemSave(form_data);
        }

        function buttonDel() {
            layer.confirm('确定删除此模块？', {icon: 3, title:'提示'}, index => {
                specialItemDel();
                layer.close(index);
            });
        }

        const place = reactive({
            place: 0,
            topArr: [],
            drapY: 0,
            scrollY: 0,
            scrollOffset: 0,
            placeShow: false
        });

        function dragsort(index) {
            index = parseInt(index);
            // console.log('index:' + index, 'place:' + place.place);
            if(place.place == index || place.place == index + 1) {
                return;
            }
            data.specialItem.splice(place.place, 0, data.specialItem[index]);
            data.specialItem.splice(place.place > index ? index : index + 1, 1);
            const sort_data = [];
            data.specialItem.forEach((item, key) => {
                if(item.sort != key) {
                    sort_data.push(item.id + ':' + key);
                }
            });
            // console.log(sort_data);
            specialItemSort(sort_data);
        }

        function dragstart(e, module_name) {
            e.dataTransfer.setData('module_name', module_name);
            data.itemID = -1;
            place.placeShow = true;
        }

        function dragend() {
            place.placeShow = false;
        }

        function drop(e) {
            const module_name = e.dataTransfer.getData('module_name');
            if(module_name.split('_')[0] == 'sort') {
                dragsort(module_name.split('_')[1]);
                return;
            }
            const data = {};
            data.special_id = special_id;
            data.type = module_name;
            data.sort = place.place;
            specialItemAdd(data);
        }

        function scroll(e) {
            if(e.target.scrollTop == 1 || Math.abs(e.target.scrollTop - place.drapY) < 5) {
                return;
            }
            place.scrollY = e.target.scrollTop;
            place.placeShow && calcPlace();
        }

        function dragover(e) {
            if(e.pageY == 1 || Math.abs(e.pageY + place.scrollY - place.scrollOffset - place.drapY) < 5) {
                return;
            }
            place.drapY = e.pageY + place.scrollY - place.scrollOffset;
            calcPlace();
        }

        function calcPlace() {
            const top_arr = place.topArr;
            const len = top_arr.length - 1;
            const drap_y = place.drapY;
            for(let i=0; i < len; i++) {
                if(drap_y > top_arr[i] && drap_y < top_arr[i + 1]) {
                    if(Math.abs(drap_y - top_arr[i]) <= Math.abs(drap_y - top_arr[i + 1])) {
                        place.place = i;
                    } else {
                        place.place = i + 1;
                    }
                    break;
                }
            }
        }

        //获取距离顶部的高度
        function getScrollTop(selector) {
            const dom = document.getElementById(selector);
            return [dom.offsetTop, dom.offsetTop + dom.offsetHeight];
        }

        function getElementTop() {
            const top_arr = [];
            let top_bottom = null;
            data.specialItem.forEach(item => {
                top_bottom = getScrollTop('special-item-' + item.id);
                top_arr.push(top_bottom[0]);
            });
            top_bottom && top_arr.push(top_bottom[1]);
            place.topArr = top_arr;
            // console.log(top_arr);
        }

        return {
            moduleList,
            ...toRefs(data),
            ...toRefs(place),
            dragstart,
            dragend,
            dragover,
            drop,
            scroll,
            specialItemClick,
            rightClick,
            uploadDel,
            uploadAdd,
            buttonSave,
            buttonDel
        }
    }
}; 
const app = createApp(App);
app.config.compilerOptions.delimiters = ['{$', '}']
app.use(LayuiVue);
Object.keys(components).forEach(tag => {
    app.component(tag, components[tag]);
});
app.mount('.spedit');