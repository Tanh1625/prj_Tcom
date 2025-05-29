package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class HomeController {
    @Autowired
    private UserService userService;

    @GetMapping("/admin/home")
    public String home(Model model,
                       @RequestParam(name = "pageNo", defaultValue = "1") int pageNo,
                       @ModelAttribute("search") String search,
                       HttpServletRequest request) {

        Page<User> userList;

        if (search != null && !search.isEmpty()) {
            userList = userService.getUsersByName(pageNo, search);
            model.addAttribute("search", search);
        } else {
            userList = userService.getUsersByStatus(pageNo);
        }

        model.addAttribute("userList", userList);
        model.addAttribute("totalPage", userList.getTotalPages());
        model.addAttribute("currentPage", pageNo);
        return "Home";
    }

    @PostMapping("/admin/home/search")
    public String search(@RequestParam("search") String search,
                         RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("search", search);
        return "redirect:/admin/home";
    }


    @GetMapping("/api/suggestions")
    @ResponseBody
    public List<String> getSuggestions(@RequestParam("query") String query) {
        return userService.findSuggestions(query);
    }



    @GetMapping("/api/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "10") int pageSize) {
        System.out.println("Page number: " + pageNo);
        System.out.println("Search query: " + search);
        System.out.println("Page size: " + pageSize);

        // Số lượng items trên mỗi trang

        // Gọi service để lấy dữ liệu người dùng theo tìm kiếm và phân trang
        Page<User> userPage = userService.findPaginatedUsers(search, pageNo, pageSize);

        // Tạo object response
        Map<String, Object> response = new HashMap<>();
        response.put("users", userPage.getContent());
        response.put("currentPage", pageNo);
        response.put("totalPage", userPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

}

