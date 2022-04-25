$(function() {

    let layer = layui.layer
    let form = layui.form
    let laypage = layui.laypage

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date)

        const y = dt.getFullYear()
        const m = padZero(dt.getMonth() + 1)
        const d = padZero(dt.getDate())
        const hh = padZero(dt.getHours())
        const mm = padZero(dt.getMinutes())
        const ss = padZero(dt.getSeconds())

        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    }

    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定义一个查询的参数对象，将来请求数据的时候，
    // 需要将请求的参数对象提交到服务器
    let q = {
        pagenum: 1, //页码值，默认请求第一页的数据
        pagesize: 2, //每页显示几条数据，默认每页显示2条
        cate_id: '', //文章分类的id
        state: '' //文章的发布状态
    }

    initTable()
    initCate()


    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败')
                }
                // 使用模板引擎渲染页面的数据
                let str = template('tpl-table', res)
                $('tbody').html(str)
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败')
                }
                layer.msg('获取分类数据成功')
                    // 调用模板引擎渲染分类的可选项
                let str = template('tpl-cate', res)
                console.log(str)
                $('[name=cate_id]').html(str)
                    // 通知layui重新渲染表单区域的UI结构
                form.render()
            }
        })
    }

    // 为筛选表单绑定submit事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault()
            // 获取表单中选中项的值
        let cate_id = $('[name=cate_id]').val()
        let state = $('[name=state]').val()
            // 为查询参数对象q中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
            // 根据最新的筛选条件，重新渲染表格的函数
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        laypage.render({
            elem: 'pageBox', //分页容器的id
            count: total, //总数据条数
            limit: q.pagesize, //每页显示几条数据
            curr: q.pagenum, //设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页发生切换的时候，触发jump回调

            // 触发jump回调的方式有两种
            // 1.点击页码的时候，会触发jump回调
            // 2.只要调用了laypage.render()方法，就会触发jump回调
            jump: function(obj, first) {
                // 可以通过first的值，来判断是通过哪种方式触发的jump回调
                // 如果first为true，证明是方法2
                // 否则是方法1

                // 把最新的页码值，赋值到q这个查询参数对象中
                q.pagenum = obj.curr
                    // 把最新的条目数赋值到q这个查询参数对象的pagesize属性中
                q.pagesize = obj.limit
                    // 根据最新的q获取对应的数据列表，并渲染表格
                if (!first) {
                    initTable()
                }
            }
        })
    }

    // 通过事件委托的形式，为删除按钮绑定点击事件处理函数
    $('tbody').on('click', '.btn-delete', function() {
        // 获取删除按钮的个数
        let len = $('.btn-delete').length
        let id = $(this).attr('data-id')
            // 询问用户是否需要删除数据
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')
                        // 当数据删除完成后，需要判断当前这一页中，是否还有剩余数据
                        // 如果没有剩余数据，则让页码值-1之后
                        // 再调用initTtable方法
                    if (len === 1) {
                        // 如果len的值等于1，证明删除完毕之后，页面上就没有任何数据了
                        // 注意：页码值最小必须为1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                    layer.close(index)
                }
            })


        });
    })
})